const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const barCodeFlowService = require("./BarCodeFlowService");
const companyService = require("../company/CompanyService");
const WarehouseService = require("../wareHouse/WareHouseService");

const { searchKeys } = require("./BarCodeFlowSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");

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
const { moduleType, actionType } = require("../../helper/enumUtils");

//add start
exports.add = async (req, res) => {
  try {
    let {
      productGroupId,
      barcodeGroupNumber,
      quantity,
      lotNumber,
      wareHouseId,
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
    const isWarehouseExists = await WarehouseService.findCount({
      _id: wareHouseId,
      isDeleted: false,
    });
    if (!isWarehouseExists) {
      throw new ApiError(httpStatus.OK, "Invalid Warehouse");
    }

    //------------------create data-------------------
    let dataCreated = await barCodeFlowService.createNewData(...req.body);

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
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "company_data",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { companyName: 1 } },
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
          companyLabel: {
            $arrayElemAt: ["$company_data.companyName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data", "company_data"] },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await barCodeFlowService.aggregateQuery(
      finalAggregateQuery
    );

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let { limit, totalData, skip } = await getLimitAndTotalCount(
      req.body.limit,
      req.body.page,
      dataFound.length,
      req.body.isPaginationRequired
    );

    finalAggregateQuery.push({
      $group: {
        _id: "$barcodeNumber", // Group by barcodeNumber
        barcodeNumber: { $first: "$barcodeNumber" },
        productGroupLabel: { $first: "$productGroupLabel" },
        data: { $push: "$$ROOT" }, // Store grouped documents in an array called "data"
      },
    });
    let groupResult = await barCodeFlowService.aggregateQuery(
      finalAggregateQuery
    );
    let {
      totalData: groupTotalData,
      page,
      totalpages,
    } = await getLimitAndTotalCount(
      req.body.limit,
      req.body.page,
      groupResult.length,
      req.body.isPaginationRequired
    );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.barcode,
      userRoleData,
      actionType.pagination
    );
    let result = await barCodeFlowService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(httpStatus.OK).send({
        data: allowedFields,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: groupTotalData,
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

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.barcode,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await barCodeFlowService.aggregateQuery(additionalQuery);
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

//single view api
exports.getById = async (req, res) => {
  try {
    //if no default query then pass {}
    let barcodeToBeSearch = req.params.barcode;
    let additionalQuery = [
      {
        barcodeNumber: barcodeToBeSearch,
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

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.barcode,
      userRoleData,
      actionType.view
    );
    let dataExist = await barCodeFlowService.aggregateQuery(additionalQuery);
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
