const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const purchaseOrderService = require("../../services/PurchaseOrderService");
const { searchKeys } = require("../../model/PurchaseOrderSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");

const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const { default: mongoose } = require("mongoose");

//add start
exports.add = async (req, res) => {
  try {
    let { poCode, vendorId, wareHouseId, purchaseOrder } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await purchaseOrderService.isExists([{ poCode }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------
    let dataCreated = await purchaseOrderService.createNewData({ ...req.body });

    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: "Added successfully.",
        data: dataCreated,
        status: true,
        code: null,
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//update start
exports.update = async (req, res) => {
  try {
    let { poCode, vendorId, wareHouseId, purchaseOrder } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await purchaseOrderService.isExists(
      [{ poCode }],
      idToBeSearch
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------Find data-------------------
    let datafound = await purchaseOrderService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `PurchaseOrder not found.`);
    }

    let dataUpdated = await purchaseOrderService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          ...req.body,
        },
      }
    );

    if (dataUpdated) {
      return res.status(httpStatus.CREATED).send({
        message: "Updated successfully.",
        data: dataUpdated,
        status: true,
        code: null,
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// all filter pagination api
exports.allFilterPagination = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.params;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };
    /**
     * to send only active data on web
     */
    if (req.path.includes("/app/") || req.path.includes("/app")) {
      matchQuery.$and.push({ isActive: true });
    }

    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue
    );

    //----------------------------

    /**
     * check search keys valid
     **/

    let searchQueryCheck = checkInvalidParams(searchIn, searchKeys);

    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({
        ...searchQueryCheck,
      });
    }
    /**
     * get searchQuery
     */
    const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue);
    if (searchQuery && searchQuery.length) {
      matchQuery.$and.push({ $or: searchQuery });
    }
    //----------------------------
    /**
     * get range filter query
     */
    const rangeQuery = getRangeQuery(rangeFilterBy);
    if (rangeQuery && rangeQuery.length) {
      matchQuery.$and.push(...rangeQuery);
    }

    //----------------------------
    /**
     * get filter query
     */
    let booleanFields = [];
    let numberFileds = ["poCode", "vendorId", "wareHouseId"];

    const filterQuery = getFilterQuery(filterBy, booleanFields, numberFileds);
    if (filterQuery && filterQuery.length) {
      matchQuery.$and.push(...filterQuery);
    }
    //----------------------------
    //calander filter
    /**
     * ToDo : for date filter
     */

    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendors_name",
          pipeline: [{ $project: { companyName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          purchaseOrder: {
            $map: {
              input: "$purchaseOrder",
              as: "purchaseOrderone",
              in: {
                itemName: "",
                itemId: "$$purchaseOrderone.itemId",
                rate: "$$purchaseOrderone.rate",
                quantity: "$$purchaseOrderone.quantity",
                estReceivingDate: "$$purchaseOrderone.estReceivingDate",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "purchaseOrder.itemId",
          foreignField: "_id",
          as: "purchaseOrders",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },
      {
        $addFields: {
          vendorLabel: {
            $arrayElemAt: ["$vendors_name.companyName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          purchaseOrder: {
            $map: {
              input: "$purchaseOrder",
              as: "purchaseOrderone",
              in: {
                $mergeObjects: [
                  "$$purchaseOrderone",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$purchaseOrders",
                          as: "purchaseOrdertwo",
                          cond: {
                            $eq: [
                              { $toString: "$$purchaseOrdertwo._id" },
                              { $toString: "$$purchaseOrderone.itemId" },
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unset: ["vendors_name", "warehouses_name"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await purchaseOrderService.aggregateQuery(
      finalAggregateQuery
    );
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        dataFound.length,
        req.body.isPaginationRequired
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }

    let result = await purchaseOrderService.aggregateQuery(finalAggregateQuery);
    if (result.length) {
      return res.status(200).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
      });
    } else {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};
//get api
exports.get = async (req, res) => {
  try {
    //if no default query then pass {}
    let matchQuery = { isDeleted: false };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendors_name",
          pipeline: [{ $project: { companyName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          purchaseOrder: {
            $map: {
              input: "$purchaseOrder",
              as: "purchaseOrderone",
              in: {
                itemName: "",
                itemId: "$$purchaseOrderone.itemId",
                rate: "$$purchaseOrderone.rate",
                quantity: "$$purchaseOrderone.quantity",
                estReceivingDate: "$$purchaseOrderone.estReceivingDate",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "purchaseOrder.itemId",
          foreignField: "_id",
          as: "purchaseOrders",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },
      {
        $addFields: {
          vendorLabel: {
            $arrayElemAt: ["$vendors_name.companyName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          purchaseOrder: {
            $map: {
              input: "$purchaseOrder",
              as: "purchaseOrderone",
              in: {
                $mergeObjects: [
                  "$$purchaseOrderone",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$purchaseOrders",
                          as: "purchaseOrdertwo",
                          cond: {
                            $eq: [
                              { $toString: "$$purchaseOrdertwo._id" },
                              { $toString: "$$purchaseOrderone.itemId" },
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unset: ["vendors_name", "warehouses_name"],
      },
    ];
    let dataExist = await purchaseOrderService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist,
        code: null,
        issue: null,
      });
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//single view api
exports.getById = async (req, res) => {
  try {
    //if no default query then pass {}
    let idToBeSearch = req.params.id;

    let additionalQuery = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(idToBeSearch),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendors_name",
          pipeline: [{ $project: { companyName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          purchaseOrder: {
            $map: {
              input: "$purchaseOrder",
              as: "purchaseOrderone",
              in: {
                itemName: "",
                itemId: "$$purchaseOrderone.itemId",
                rate: "$$purchaseOrderone.rate",
                quantity: "$$purchaseOrderone.quantity",
                estReceivingDate: "$$purchaseOrderone.estReceivingDate",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "purchaseOrder.itemId",
          foreignField: "_id",
          as: "purchaseOrders",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },
      {
        $addFields: {
          vendorLabel: {
            $arrayElemAt: ["$vendors_name.companyName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          purchaseOrder: {
            $map: {
              input: "$purchaseOrder",
              as: "purchaseOrderone",
              in: {
                $mergeObjects: [
                  "$$purchaseOrderone",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$purchaseOrders",
                          as: "purchaseOrdertwo",
                          cond: {
                            $eq: [
                              { $toString: "$$purchaseOrdertwo._id" },
                              { $toString: "$$purchaseOrderone.itemId" },
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unset: ["vendors_name", "warehouses_name"],
      },
    ];
    let dataExist = await purchaseOrderService.aggregateQuery(additionalQuery);
    if (!dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist[0],
        code: null,
        issue: null,
      });
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await purchaseOrderService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await purchaseOrderService.getOneAndDelete({ _id });
    if (!deleted) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: null,
      code: null,
      issue: null,
    });
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};
//statusChange
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await purchaseOrderService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await purchaseOrderService.getOneAndUpdate(
      { _id },
      { isActive }
    );
    if (!statusChanged) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: statusChanged,
      code: null,
      issue: null,
    });
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};
