const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const batchService = require("./BatchService");
const orderService = require("../orderInquiry/OrderInquiryService");
const userService = require("../user/UserService");
const orderInquiryFlowService = require("../orderInquiryFlow/OrderInquiryFlowService");
const { searchKeys } = require("./BatchSchema");
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
const { getInquiryNumber } = require("./BatchHelper");
const { default: axios } = require("axios");
const { userEnum } = require("../../helper/enumUtils");
const { default: mongoose } = require("mongoose");

//add start
exports.add = async (req, res) => {
  try {
    let { orders, batchAssignedTo } = req.body;
    /**
     * check duplicate exist
     */
    console.log(batchAssignedTo, "batchAssignedTo");
    let isUserExists = await userService?.getOneByMultiField({
      _id: batchAssignedTo,
      isActive: true,
      isDeleted: false,
    });
    console.log(isUserExists, "isUserExists");
    if (!isUserExists) {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Invalid user`);
    }
    let batchNumber = await getInquiryNumber();
    //------------------create data-------------------
    let dataCreated = await batchService.createNewData({
      orders,
      batchCreatedBy: req.userData.Id,
      batchNumber: batchNumber,
      batchAssignedTo: batchAssignedTo,
    });
    if (dataCreated) {
      // Map over orders and create an array of promises
      let orderPromises = orders?.map(async (ele) => {
        let updatedOrder = await orderService?.getOneAndUpdate(
          { _id: ele },
          {
            $set: {
              batchId: dataCreated?._id,
            },
          }
        );
        await orderInquiryFlowService.createNewData({
          ...updatedOrder, // Assuming updatedOrder is not undefined
          orderId: updatedOrder?._id,
          batchId: dataCreated?._id,
        });
      });

      // Await all the promises
      await Promise.all(orderPromises);
    }

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
    let { batchNumber, batchCreatedBy, orders } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await batchService.isExists([{ batchNumber }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------Find data-------------------
    let datafound = await batchService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Batch not found.`);
    }

    let dataUpdated = await batchService.getOneAndUpdate(
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

    if (req.userData.role !== userEnum.admin) {
      matchQuery.$and.push({
        batchAssignedTo: new mongoose.Types.ObjectId(req.userData.Id),
      });
    }
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
    let numberFileds = ["batchNumber"];
    let objectIdFields = ["batchCreatedBy"];
    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFields
    );
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
          from: "users",
          localField: "batchCreatedBy",
          foreignField: "_id",
          as: "batchCreatedData",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },

      {
        $addFields: {
          batchCreatedByLabel: {
            $concat: [
              { $arrayElemAt: ["$batchCreatedData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$batchCreatedData.lastName", 0] },
            ],
          },
        },
      },

      {
        $unset: ["batchCreatedData"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await batchService.aggregateQuery(finalAggregateQuery);
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

    let result = await batchService.aggregateQuery(finalAggregateQuery);
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

    let dataExist = await batchService.findAllWithQuery(matchQuery);

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

//get by id
exports.getById = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;
    let dataExist = await batchService.getOneByMultiField({
      _id: idToBeSearch,
      isDeleted: false,
    });

    if (!dataExist) {
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

// get batch orders
exports.getBatchOrder = async (req, res) => {
  try {
    let batchid = req.params.batchid;
    let dataExist = await batchService.getOneByMultiField({
      _id: batchid,
      isDeleted: false,
    });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Something went wrong");
    }
    let matchQuery = {
      _id: { $in: dataExist?.orders },
      isDeleted: false,
      isActive: true,
    };

    let allOrders = await orderService?.aggregateQuery([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "pincodeId",
          foreignField: "_id",
          as: "pincodeData",
          pipeline: [
            {
              $project: {
                pincode: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "assignDealerId",
          foreignField: "_id",
          as: "dealer_data",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                dealerCode: 1,
                isActive: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "assignWarehouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          pincodeLabel: {
            $arrayElemAt: ["$pincodeData.pincode", 0],
          },
          assignWarehouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
          assignDealerLabel: {
            $concat: [
              { $arrayElemAt: ["$dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$dealer_data.lastName", 0] },
            ],
          },
        },
      },
      {
        $unset: ["pincodeData", "warehouse_data", "dealer_data"],
      },
    ]);

    if (!allOrders) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: allOrders,
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
    if (!(await batchService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await batchService.getOneAndDelete({ _id });
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
    let dataExist = await batchService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await batchService.getOneAndUpdate(
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
