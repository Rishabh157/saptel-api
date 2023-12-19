const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const barCodeService = require("./BarCodeService");
const companyService = require("../company/CompanyService");
const barcodeFlowService = require("../barCodeFlow/BarCodeFlowService");
const salesOrderService = require("../salesOrder/SalesOrderService");
const WarehouseService = require("../wareHouse/WareHouseService");
const wtwMasterService = require("../warehouseToWarehouse/wtwMasterService");
const wtcMasterService = require("../warehouseToCompany/wtcMasterService");
const wtsMasterService = require("../warehouseToSample/wtsMasterService");
const dtwMasterService = require("../dealerToWarehouse/dtwMasterService");

const orderInquiryService = require("../orderInquiry/OrderInquiryService");
const orderInquiryFlowService = require("../orderInquiryFlow/OrderInquiryFlowService");
const ProductGroupService = require("../productGroup/ProductGroupService");
const rtvMasterService = require("../rtvMaster/RtvMasterService");
const { searchKeys } = require("./BarCodeSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const { getDealerData } = require("../../middleware/authenticationCheck");
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
const {
  moduleType,
  actionType,
  barcodeStatusType,
  productStatus,
} = require("../../helper/enumUtils");

//add start
exports.add = async (req, res) => {
  try {
    let {
      productGroupId,
      barcodeGroupNumber,
      quantity,
      lotNumber,
      companyId,
      status,
    } = req.body;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    /**
     * check duplicate exist
     */
    let dataExist = await barCodeService.isExists([
      { lotNumber },
      { barcodeGroupNumber },
    ]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    let lastObject = await barCodeService.aggregateQuery([
      { $sort: { _id: -1 } },
      { $limit: 1 },
      {
        $match: {
          lotNumber: lotNumber,
        },
      },
    ]);

    let currentBarcode = "";
    if (lastObject.length) {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Duplicate Lot Number.`);
    } else {
      currentBarcode = "000001";
    }

    let output = [];

    for (let i = 0; i < quantity; i++) {
      if (i > 0) {
        paddeeBarcode = JSON.stringify(parseInt(currentBarcode) + 1);
        currentBarcode = paddeeBarcode.toString().padStart(6, "0");
      }
      output.push({
        productGroupId,
        barcodeGroupNumber,
        barcodeNumber: lotNumber + currentBarcode,
        lotNumber,
        wareHouseId: null,
        companyId,
        status: "",
      });
    }

    //------------------create data-------------------
    let dataCreated = await barCodeService.createMany(output);
    await barcodeFlowService.createMany(output);
    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: "Added successfully.",
        data: dataCreated,
        status: true,
        code: "CREATED",
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
    let { productGroupId, wareHouseId, companyId } = req.body;

    let idToBeSearch = req.params.id;
    // let dataExist = await barCodeService.isExists(
    //   [{ barcodeNumber }],
    //   idToBeSearch
    // );
    // if (dataExist.exists && dataExist.existsSummary) {
    //   throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    // }
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    const isWarehouseExists = await WarehouseService.findCount({
      _id: wareHouseId,
      isDeleted: false,
    });
    if (!isWarehouseExists) {
      throw new ApiError(httpStatus.OK, "Invalid Warehouse");
    }
    /**
     * check duplicate exist
     */
    // let isdataExist = await barCodeService.isExists(
    //   [{ lotNumber }],
    //   idToBeSearch
    // );
    // if (isdataExist.exists && isdataExist.existsSummary) {
    //   throw new ApiError(httpStatus.OK, isdataExist.existsSummary);
    // }

    //------------------Find data-------------------
    let datafound = await barCodeService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `BarCode not found.`);
    }

    let dataUpdated = await barCodeService.getOneAndUpdate(
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
    await barcodeFlowService.createNewData({
      productGroupId: dataUpdated.productGroupId,
      barcodeNumber: dataUpdated.barcodeNumber,
      barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
      lotNumber: dataUpdated.lotNumber,
      isUsed: dataUpdated.isUsed,
      wareHouseId: dataUpdated.wareHouseId,
      status: dataUpdated.status,
      companyId: dataUpdated.companyId,
    });

    if (dataUpdated) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: dataUpdated,
        status: true,
        code: "OK",
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
    let booleanFields = ["isDeleted"];
    let numberFileds = [];
    let objectIdFields = ["productGroupId", "companyId"];

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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    console.log(matchQuery, "matchQuery");

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);
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
    let userRoleData = await getUserRoleData(req, barCodeService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.barcode,
      userRoleData,
      actionType.pagination
    );
    let result = await barCodeService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(httpStatus.OK).send({
        data: allowedFields,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
        code: "OK",
        issue: null,
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
// all filter pagination api
exports.allFilterGroupPagination = async (req, res) => {
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
    let numberFileds = ["productGroupId"];

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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    finalAggregateQuery.push({
      $group: {
        _id: "$barcodeGroupNumber",
        // data: { $push: "$$ROOT" },
        barcodeGroupNumber: { $first: "$barcodeGroupNumber" },
        companyId: { $first: "$companyId" },
        createdAt: { $first: "$createdAt" },
        productGroupLabel: { $first: "$productGroupLabel" },
      },
    });
    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);
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

    // return res.send(finalAggregateQuery);
    let result = await barCodeService.aggregateQuery(finalAggregateQuery);
    if (result.length) {
      return res.status(httpStatus.OK).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
        code: "OK",
        issue: null,
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
    let matchQuery = {
      isDeleted: false,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    let userRoleData = await getUserRoleData(req, barCodeService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.barcode,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await barCodeService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields || !allowedFields?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: allowedFields,
        code: "OK",
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
//get api
exports.getAllByGroup = async (req, res) => {
  try {
    //if no default query then pass {}
    let groupId = req.params.id;
    let matchQuery = {
      isDeleted: false,
      barcodeGroupNumber: groupId,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },

      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    let dataExist = await barCodeService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist,
        code: "OK",
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
    console.log("yha");
    //if no default query then pass {}
    let idToBeSearch = req.params.id;
    let additionalQuery = [
      {
        _id: new mongoose.Types.ObjectId(idToBeSearch),
        isDeleted: false,
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    let userRoleData = await getUserRoleData(req, barCodeService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.barcode,
      userRoleData,
      actionType.view
    );
    let dataExist = await barCodeService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: allowedFields[0],
        code: "OK",
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
exports.getByBarcode = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;
    const productGroupId = req.params.productgroupid;
    const status = req.params.status;
    const cid = req.params.cid;
    console.log(barcodeToBeSearch, status, productGroupId, cid);
    let additionalQueryForAll = [
      {
        $match: {
          outerBoxbarCodeNumber: barcodeToBeSearch,
          isUsed: true,
          status: status,
          productGroupId: new mongoose.Types.ObjectId(productGroupId),
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let additionalQueryForOne = [
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
          isUsed: true,
          status: status,
          productGroupId: new mongoose.Types.ObjectId(productGroupId),
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let ResponseData = [];
    const dataExist = await barCodeService.aggregateQuery(
      additionalQueryForAll
    );
    console.log(dataExist, "dataExist");
    if (dataExist.length === 0) {
      const foundBarcode = await barCodeService.aggregateQuery(
        additionalQueryForOne
      );
      if (foundBarcode[0] !== null && foundBarcode[0] !== undefined) {
        ResponseData.push(foundBarcode[0]);
      }
    } else {
      ResponseData = dataExist;
    }

    if (ResponseData.length === 0) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: ResponseData,
        code: "OK",
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

// scan barcode at dealer warehouse

exports.getByBarcodeAtDealerWarehouse = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;
    const productGroupId = req.params.productgroupid;
    const status = req.params.status;
    const cid = req.params.cid;
    let additionalQueryForAll = [
      {
        $match: {
          outerBoxbarCodeNumber: barcodeToBeSearch,
          isUsed: true,
          status: status,
          productGroupId: new mongoose.Types.ObjectId(productGroupId),
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let additionalQueryForOne = [
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
          isUsed: true,
          status: status,
          productGroupId: new mongoose.Types.ObjectId(productGroupId),
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let ResponseData = [];
    const dataExist = await barCodeService.aggregateQuery(
      additionalQueryForAll
    );
    if (dataExist.length === 0) {
      const foundBarcode = await barCodeService.aggregateQuery(
        additionalQueryForOne
      );
      if (foundBarcode[0] !== null && foundBarcode[0] !== undefined) {
        ResponseData.push(foundBarcode[0]);
      }
    } else {
      ResponseData = dataExist[0];
    }

    if (ResponseData.length === 0) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: ResponseData,
        code: "OK",
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

exports.getBarcode = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;
    console.log("inn", barcodeToBeSearch);
    let additionalQuery = [
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
          isUsed: false,
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let barcode = [];
    const foundBarcode = await barCodeService.aggregateQuery(additionalQuery);
    if (foundBarcode !== null) {
      barcode.push(foundBarcode[0]);
    }

    if (barcode.length === 0) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: barcode[0],
        code: "OK",
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
//inventory api
exports.getInventory = async (req, res) => {
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
    const cid = req.params.cid;
    const wid = req.params.wid;
    const status = req.params.status;

    const isCompanyExists = await companyService.findCount({
      _id: cid,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    const isWarehouseExists = await WarehouseService.findCount({
      _id: wid,
      isDeleted: false,
    });
    if (!isWarehouseExists) {
      throw new ApiError(httpStatus.OK, "Invalid Warehouse");
    }

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
    let numberFileds = [];
    let objectIdFields = ["productGroupId", "companyId", "wareHouseId"];

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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
      {
        $match: {
          isUsed: true, // You can add any additional match criteria here if needed
          status: status,
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $group: {
          _id: {
            wareHouseId: `$${wid}`,
            productGroupId: `$productGroupId`,
          },
          productGroupLabel: { $first: "$productGroupLabel" },
          count: { $sum: 1 }, // Count the documents in each group
          firstDocument: { $first: "$$ROOT" }, // Get the first document in each group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          wareHouseId: "$_id.wareHouseId",
          productGroupId: "$_id.productGroupId",
          count: 1, // Include the count field
          firstDocument: 1, // Include the firstDocument field
          productGroupLabel: 1,
          wareHouseLabel: 1,
        },
      },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
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
    let userRoleData = await getUserRoleData(req, barCodeService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.barcode,
      userRoleData,
      actionType.pagination
    );
    let result = await barCodeService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(httpStatus.OK).send({
        data: allowedFields,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
        code: "OK",
        issue: null,
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

//inventory by status

exports.getInventoryByStatus = async (req, res) => {
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
    const cid = req.params.cid;
    const status = req.params.status;

    const isCompanyExists = await companyService.findCount({
      _id: cid,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

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
    let numberFileds = [];
    let objectIdFields = [
      "productGroupId",
      "companyId",
      "wareHouseId",
      "vendorId",
    ];

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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
      {
        $match: {
          isUsed: true, // You can add any additional match criteria here if needed
          status: status,
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $group: {
          _id: {
            productGroupId: `$productGroupId`,
          },
          productGroupLabel: { $first: "$productGroupLabel" },
          count: { $sum: 1 }, // Count the documents in each group
          firstDocument: { $first: "$$ROOT" }, // Get the first document in each group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          // wareHouseId: "$_id.wareHouseId",
          productGroupId: "$_id.productGroupId",
          count: 1, // Include the count field
          firstDocument: 1, // Include the firstDocument field
          productGroupLabel: 1,
          wareHouseLabel: 1,
        },
      },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
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
    let userRoleData = await getUserRoleData(req, barCodeService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.barcode,
      userRoleData,
      actionType.pagination
    );
    let result = await barCodeService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(httpStatus.OK).send({
        data: allowedFields,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
        code: "OK",
        issue: null,
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

// dealer inventory

exports.getDealerInventory = async (req, res) => {
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
    const cid = req.params.cid;
    // const wid = req.params.wid;
    const status = req.params.status;

    const isCompanyExists = await companyService.findCount({
      _id: cid,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    // const isWarehouseExists = await WarehouseService.findCount({
    //   _id: wid,
    //   isDeleted: false,
    // });
    // if (!isWarehouseExists) {
    //   throw new ApiError(httpStatus.OK, "Invalid Warehouse");
    // }

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
    let numberFileds = [];
    let objectIdFields = ["productGroupId", "companyId", "wareHouseId"];

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
    console.log("herere dealer");
    let additionalQuery = [
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
      {
        $match: {
          isUsed: true, // You can add any additional match criteria here if needed
          status: status,
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $group: {
          _id: {
            // wareHouseId: `$${wid}`,
            productGroupId: `$productGroupId`,
            productGroupLabel: `$productGroupLabel`,
          },
          count: { $sum: 1 }, // Count the documents in each group
          firstDocument: { $first: "$$ROOT" }, // Get the first document in each group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          wareHouseId: "$_id.wareHouseId",
          productGroupId: "$_id.productGroupId",
          count: 1, // Include the count field
          firstDocument: 1, // Include the firstDocument field
          productGroupLabel: 1,
          wareHouseLabel: 1,
        },
      },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
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

    let result = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (result?.length) {
      return res.status(httpStatus.OK).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
        code: "OK",
        issue: null,
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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await barCodeService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await barCodeService.getOneAndDelete({ _id });
    if (!deleted) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: null,
      code: "OK",
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
    let dataExist = await barCodeService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await barCodeService.getOneAndUpdate(
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
      code: "OK",
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

// update many for invert inventory

exports.updateInventory = async (req, res) => {
  try {
    console.log("innnnn");
    let { barcodedata } = req.body;
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentHour = currentDate.getHours(); // Hour of the day (0-23)
    const currentMinute = currentDate.getMinutes(); // Minute of the hour (0-59)
    const currentSecond = currentDate.getSeconds();
    let outerBoxCode =
      barcodedata[0]?.lotNumber +
      currentDay +
      currentHour +
      currentMinute +
      currentSecond;
    console.log(outerBoxCode, "outerBoxCode");
    const promises = barcodedata?.map(async (ele) => {
      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isDeleted: false,
        },
        {
          $set: {
            isUsed: true,
            status: barcodeStatusType.atWarehouse,
            outerBoxbarCodeNumber: outerBoxCode,
            wareHouseId: ele?.wareHouseId,
          },
        }
      );
      await barcodeFlowService.createNewData({
        productGroupId: dataUpdated.productGroupId,
        barcodeNumber: dataUpdated.barcodeNumber,
        cartonBoxId: dataUpdated.cartonBoxId,
        barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
        outerBoxbarCodeNumber: outerBoxCode,
        lotNumber: dataUpdated.lotNumber,
        isUsed: dataUpdated.isUsed,
        wareHouseId: dataUpdated.wareHouseId,
        status: dataUpdated.status,
        companyId: dataUpdated.companyId,
      });
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: updatedDataArray[0],
        status: true,
        code: "OK",
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

// update warehouse inventory also other company warehouse

exports.updateWarehouseInventory = async (req, res) => {
  try {
    let { barcodedata, wId, from } = req.body;
    console.log("barcodedata", barcodedata);
    const promises = barcodedata?.map(async (ele) => {
      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isDeleted: false,
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.atWarehouse,
            wareHouseId: ele?.wareHouseId,
            companyId: ele?.fromCompanyId,
          },
        }
      );
      if (from === barcodeStatusType.wtw) {
        wId?.forEach(async (wtwid) => {
          await wtwMasterService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(wtwid),
              isDeleted: false,
            },
            {
              $set: {
                status: productStatus.complete,
              },
            }
          );
        });
      } else if (from === barcodeStatusType.wtc) {
        wId?.forEach(async (wtcid) => {
          await wtcMasterService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(wtcid),
              isDeleted: false,
            },
            {
              $set: {
                status: productStatus.complete,
              },
            }
          );
        });
      } else if (from === barcodeStatusType.wts) {
        wId?.forEach(async (wtsid) => {
          await wtsMasterService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(wtsid),
              isDeleted: false,
            },
            {
              $set: {
                status: productStatus.complete,
              },
            }
          );
        });
      } else if (from === barcodeStatusType.dtw) {
        wId?.forEach(async (dtwid) => {
          await dtwMasterService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(dtwid),
              isDeleted: false,
            },
            {
              $set: {
                status: productStatus.complete,
              },
            }
          );
        });
      }

      await barcodeFlowService.createNewData({
        productGroupId: dataUpdated.productGroupId,
        barcodeNumber: dataUpdated.barcodeNumber,
        cartonBoxId: dataUpdated.cartonBoxId,
        barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
        outerBoxbarCodeNumber: dataUpdated.outerBoxbarCodeNumber,
        lotNumber: dataUpdated.lotNumber,
        isUsed: dataUpdated.isUsed,
        wareHouseId: dataUpdated.wareHouseId,
        status: dataUpdated.status,
        companyId: dataUpdated.companyId,
      });
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: updatedDataArray[0],
        status: true,
        code: "OK",
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
// dealer outward api

exports.outwardInventory = async (req, res) => {
  try {
    let { barcodedata, soId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        console.log(fele?.outerBoxbarCodeNumber, ele?.outerBoxbarCodeNumber);
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        await barcodeFlowService.createNewData({
          productGroupId: ele.productGroupId,
          barcodeNumber: ele.barcodeNumber,
          cartonBoxId: null,
          barcodeGroupNumber: ele.barcodeGroupNumber,
          outerBoxbarCodeNumber: null,
          lotNumber: ele.lotNumber,
          isUsed: ele.isUsed,
          wareHouseId: ele.wareHouseId,
          status: barcodeStatusType.inTransit,
          companyId: ele.companyId,
        });
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.inTransit,
            wareHouseId: null,
          },
        }
      );
      soId?.forEach(async (soid) => {
        await salesOrderService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(soid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
      });
      await barcodeFlowService.createNewData({
        productGroupId: dataUpdated.productGroupId,
        barcodeNumber: dataUpdated.barcodeNumber,
        cartonBoxId: dataUpdated.cartonBoxId,
        barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
        outerBoxbarCodeNumber: dataUpdated.outerBoxCode,
        lotNumber: dataUpdated.lotNumber,
        isUsed: dataUpdated.isUsed,
        wareHouseId: dataUpdated.wareHouseId,
        status: dataUpdated.status,
        companyId: dataUpdated.companyId,
      });
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
        status: true,
        code: "OK",
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

// rtv outward

exports.rtvOutwardInventory = async (req, res) => {
  try {
    let { barcodedata, rtvId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        console.log(fele?.outerBoxbarCodeNumber, ele?.outerBoxbarCodeNumber);
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });
      console.log(foundObj, "foundObj");

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        await barcodeFlowService.createNewData({
          productGroupId: ele.productGroupId,
          barcodeNumber: ele.barcodeNumber,
          cartonBoxId: null,
          barcodeGroupNumber: ele.barcodeGroupNumber,
          outerBoxbarCodeNumber: null,
          lotNumber: ele.lotNumber,
          isUsed: ele.isUsed,
          wareHouseId: ele.wareHouseId,
          status: barcodeStatusType.inTransit,
          companyId: ele.companyId,
        });
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.rtv,
            vendorId: new mongoose.Types.ObjectId(ele?.vendorId),
            wareHouseId: null,
          },
        }
      );
      rtvId?.forEach(async (rtvid) => {
        await rtvMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(rtvid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
      });
      await barcodeFlowService.createNewData({
        productGroupId: dataUpdated.productGroupId,
        barcodeNumber: dataUpdated.barcodeNumber,
        cartonBoxId: dataUpdated.cartonBoxId,
        barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
        outerBoxbarCodeNumber: dataUpdated.outerBoxCode,
        lotNumber: dataUpdated.lotNumber,
        isUsed: dataUpdated.isUsed,
        wareHouseId: dataUpdated.wareHouseId,
        status: dataUpdated.status,
        companyId: dataUpdated.companyId,
      });
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
        status: true,
        code: "OK",
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

// wtw outward

exports.wtwOutwardInventory = async (req, res) => {
  try {
    let { barcodedata, wtwId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        console.log(fele?.outerBoxbarCodeNumber, ele?.outerBoxbarCodeNumber);
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });
      console.log(foundObj, "foundObj");

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        await barcodeFlowService.createNewData({
          productGroupId: ele.productGroupId,
          barcodeNumber: ele.barcodeNumber,
          cartonBoxId: null,
          barcodeGroupNumber: ele.barcodeGroupNumber,
          outerBoxbarCodeNumber: null,
          lotNumber: ele.lotNumber,
          isUsed: ele.isUsed,
          wareHouseId: ele.wareHouseId,
          status: barcodeStatusType.inTransit,
          companyId: ele.companyId,
        });
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.wtw,
            wareHouseId: null,
          },
        }
      );
      wtwId?.forEach(async (wtwid) => {
        await wtwMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(wtwid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
      });
      await barcodeFlowService.createNewData({
        productGroupId: dataUpdated.productGroupId,
        barcodeNumber: dataUpdated.barcodeNumber,
        cartonBoxId: dataUpdated.cartonBoxId,
        barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
        outerBoxbarCodeNumber: dataUpdated.outerBoxCode,
        lotNumber: dataUpdated.lotNumber,
        isUsed: dataUpdated.isUsed,
        wareHouseId: dataUpdated.wareHouseId,
        status: dataUpdated.status,
        companyId: dataUpdated.companyId,
      });
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
        status: true,
        code: "OK",
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

//dtw outward

exports.dtwOutwardInventory = async (req, res) => {
  try {
    let { barcodedata, dtwId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        console.log(fele?.outerBoxbarCodeNumber, ele?.outerBoxbarCodeNumber);
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });
      console.log(foundObj, "foundObj");

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        await barcodeFlowService.createNewData({
          productGroupId: ele.productGroupId,
          barcodeNumber: ele.barcodeNumber,
          cartonBoxId: null,
          barcodeGroupNumber: ele.barcodeGroupNumber,
          outerBoxbarCodeNumber: null,
          lotNumber: ele.lotNumber,
          isUsed: ele.isUsed,
          wareHouseId: ele.wareHouseId,
          status: barcodeStatusType.inTransit,
          companyId: ele.companyId,
        });
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.dtw,
            wareHouseId: ele.wareHouseId,
          },
        }
      );
      dtwId?.forEach(async (dtwid) => {
        await dtwMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(dtwid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
      });
      await barcodeFlowService.createNewData({
        productGroupId: dataUpdated.productGroupId,
        barcodeNumber: dataUpdated.barcodeNumber,
        cartonBoxId: dataUpdated.cartonBoxId,
        barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
        outerBoxbarCodeNumber: dataUpdated.outerBoxCode,
        lotNumber: dataUpdated.lotNumber,
        isUsed: dataUpdated.isUsed,
        wareHouseId: dataUpdated.wareHouseId,
        status: dataUpdated.status,
        companyId: dataUpdated.companyId,
      });
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
        status: true,
        code: "OK",
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

// wtc outward

exports.wtcOutwardInventory = async (req, res) => {
  try {
    let { barcodedata, wtcId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        console.log(fele?.outerBoxbarCodeNumber, ele?.outerBoxbarCodeNumber);
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });
      console.log(foundObj, "foundObj");

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        await barcodeFlowService.createNewData({
          productGroupId: ele.productGroupId,
          barcodeNumber: ele.barcodeNumber,
          cartonBoxId: null,
          barcodeGroupNumber: ele.barcodeGroupNumber,
          outerBoxbarCodeNumber: null,
          lotNumber: ele.lotNumber,
          isUsed: ele.isUsed,
          wareHouseId: ele.wareHouseId,
          status: barcodeStatusType.inTransit,
          companyId: ele.companyId,
        });
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.wtc,
            wareHouseId: null,
            companyId: ele?.toCompanyId,
          },
        }
      );
      wtcId?.forEach(async (wtcid) => {
        await wtcMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(wtcid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
      });
      await barcodeFlowService.createNewData({
        productGroupId: dataUpdated.productGroupId,
        barcodeNumber: dataUpdated.barcodeNumber,
        cartonBoxId: dataUpdated.cartonBoxId,
        barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
        outerBoxbarCodeNumber: dataUpdated.outerBoxCode,
        lotNumber: dataUpdated.lotNumber,
        isUsed: dataUpdated.isUsed,
        wareHouseId: dataUpdated.wareHouseId,
        status: dataUpdated.status,
        companyId: dataUpdated.companyId,
      });
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
        status: true,
        code: "OK",
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

// wts outward

exports.wtsOutwardInventory = async (req, res) => {
  try {
    let { barcodedata, wtsId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        console.log(fele?.outerBoxbarCodeNumber, ele?.outerBoxbarCodeNumber);
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });
      console.log(foundObj, "foundObj");

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        await barcodeFlowService.createNewData({
          productGroupId: ele.productGroupId,
          barcodeNumber: ele.barcodeNumber,
          cartonBoxId: null,
          barcodeGroupNumber: ele.barcodeGroupNumber,
          outerBoxbarCodeNumber: null,
          lotNumber: ele.lotNumber,
          isUsed: ele.isUsed,
          wareHouseId: ele.wareHouseId,
          status: barcodeStatusType.inTransit,
          companyId: ele.companyId,
        });
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.wts,
            wareHouseId: null,
          },
        }
      );
      wtsId?.forEach(async (wtsid) => {
        await wtsMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(wtsid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
      });
      await barcodeFlowService.createNewData({
        productGroupId: dataUpdated.productGroupId,
        barcodeNumber: dataUpdated.barcodeNumber,
        cartonBoxId: dataUpdated.cartonBoxId,
        barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
        outerBoxbarCodeNumber: dataUpdated.outerBoxCode,
        lotNumber: dataUpdated.lotNumber,
        isUsed: dataUpdated.isUsed,
        wareHouseId: dataUpdated.wareHouseId,
        status: dataUpdated.status,
        companyId: dataUpdated.companyId,
      });
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
        status: true,
        code: "OK",
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

// dispatch order from warehouse

exports.orderDispatch = async (req, res) => {
  try {
    let { barcodedata, orderId } = req.body;
    console.log("innn");
    let barcodeaIds = barcodedata?.map((ele) => {
      return ele?._id;
    });
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        await barcodeFlowService.createNewData({
          productGroupId: ele.productGroupId,
          barcodeNumber: ele.barcodeNumber,
          cartonBoxId: null,
          barcodeGroupNumber: ele.barcodeGroupNumber,
          outerBoxbarCodeNumber: null,
          lotNumber: ele.lotNumber,
          isUsed: ele.isUsed,
          wareHouseId: ele.wareHouseId,
          status: barcodeStatusType.atWarehouse,
          companyId: ele.companyId,
        });
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.delivered,
            wareHouseId: null,
          },
        }
      );

      await barcodeFlowService.createNewData({
        productGroupId: dataUpdated.productGroupId,
        barcodeNumber: dataUpdated.barcodeNumber,
        cartonBoxId: dataUpdated.cartonBoxId,
        barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
        outerBoxbarCodeNumber: dataUpdated.outerBoxCode,
        lotNumber: dataUpdated.lotNumber,
        isUsed: dataUpdated.isUsed,
        wareHouseId: dataUpdated.wareHouseId,
        status: dataUpdated.status,
        companyId: dataUpdated.companyId,
      });
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);
    let updatedOrder = await orderInquiryService.getOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId),
        isDeleted: false,
      },
      {
        $set: {
          orderStatus: productStatus.complete,

          barcodeId: barcodeaIds,
        },
      }
    );
    if (updatedOrder) {
      const { _id, mobileNo, didNo, companyId, agentName, agentId, ...rest } =
        updatedOrder;
      await orderInquiryFlowService.createNewData({
        orderId: updatedOrder._id,
        mobileNo: updatedOrder.mobileNo,
        didNo: updatedOrder.didNo,
        companyId: updatedOrder.companyId,
        agentName: updatedOrder.agentName,
        agentId: updatedOrder.agentId,
        ...rest,
      });
    }
    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
        status: true,
        code: "OK",
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

// dealer order dispatch

exports.dealerOrderDispatch = async (req, res) => {
  try {
    let { barcodedata, orderId, deliveryBoyId } = req.body;
    console.log("innn");
    let barcodeaIds = barcodedata?.map((ele) => {
      return ele?._id;
    });
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        await barcodeFlowService.createNewData({
          productGroupId: ele.productGroupId,
          barcodeNumber: ele.barcodeNumber,
          cartonBoxId: null,
          barcodeGroupNumber: ele.barcodeGroupNumber,
          outerBoxbarCodeNumber: null,
          lotNumber: ele.lotNumber,
          isUsed: ele.isUsed,
          wareHouseId: ele.wareHouseId,
          status: barcodeStatusType.atWarehouse,
          companyId: ele.companyId,
        });
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.inTransit,
            wareHouseId: null,
          },
        }
      );

      await barcodeFlowService.createNewData({
        productGroupId: dataUpdated.productGroupId,
        barcodeNumber: dataUpdated.barcodeNumber,
        cartonBoxId: dataUpdated.cartonBoxId,
        barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
        outerBoxbarCodeNumber: dataUpdated.outerBoxCode,
        lotNumber: dataUpdated.lotNumber,
        isUsed: dataUpdated.isUsed,
        wareHouseId: dataUpdated.wareHouseId,
        status: dataUpdated.status,
        companyId: dataUpdated.companyId,
      });
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);
    let updatedOrder = await orderInquiryService.getOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId),
        isDeleted: false,
      },
      {
        $set: {
          orderStatus: productStatus.dispatched,
          delivery_boy_id: deliveryBoyId,
          barcodeId: barcodeaIds,
        },
      }
    );
    if (updatedOrder) {
      const { _id, mobileNo, didNo, companyId, agentName, agentId, ...rest } =
        updatedOrder;
      await orderInquiryFlowService.createNewData({
        orderId: updatedOrder._id,
        mobileNo: updatedOrder.mobileNo,
        didNo: updatedOrder.didNo,
        companyId: updatedOrder.companyId,
        agentName: updatedOrder.agentName,
        agentId: updatedOrder.agentId,
        ...rest,
      });
    }
    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
        status: true,
        code: "OK",
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

// dealer side inward inventory

exports.dealerInwardInventory = async (req, res) => {
  try {
    let { barcodedata, soId } = req.body;
    const dealerId = await getDealerData(req.headers["x-access-token"]).then(
      (res) => {
        return res?.Id;
      }
    );

    const dealerWarehouse = await WarehouseService.getOneByMultiField({
      dealerId: new mongoose.Types.ObjectId(dealerId),
    });

    // const delaerWarehouse = await
    const promises = barcodedata?.map(async (ele) => {
      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.atDealerWarehouse,
            wareHouseId: dealerWarehouse._id,
            dealerId: dealerId,
          },
        }
      );
      soId?.forEach(async (soid) => {
        await salesOrderService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(soid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.complete,
            },
          }
        );
      });
      await barcodeFlowService.createNewData({
        productGroupId: dataUpdated.productGroupId,
        barcodeNumber: dataUpdated.barcodeNumber,
        cartonBoxId: dataUpdated.cartonBoxId,
        barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
        outerBoxbarCodeNumber: dataUpdated.outerBoxCode,
        lotNumber: dataUpdated.lotNumber,
        isUsed: dataUpdated.isUsed,
        wareHouseId: dataUpdated.wareHouseId,
        status: dataUpdated.status,
        companyId: dataUpdated.companyId,
      });
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
        status: true,
        code: "OK",
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
