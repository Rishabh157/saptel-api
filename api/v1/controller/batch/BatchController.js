const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const batchService = require("../../services/BatchService");
const OrderSchema = require("../../model/OrderSchema");
const orderService = require("../../services/OrderService");
const { searchKeys } = require("../../model/BatchSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const mongoose = require("mongoose");

const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");

// ============= add  start  ================
exports.add = async (req, res) => {
  try {
    let batchNo = 1;

    let lastObject = await batchService.aggregateQuery([
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);
    if (lastObject.length) {
      let batchNumber = parseInt(lastObject[0].batchNo) + 1;
      batchNo = batchNumber;
    }

    let isOrderExists = await orderService.aggregateQuery([
      {
        $match: { $and: [{ batchNo: "" }, { isDeleted: false }] },
      },
    ]);
    if (!isOrderExists.length) {
      throw new ApiError(httpStatus.OK, "No Order To Create A Batch.");
    }
    req.body.orderCount = isOrderExists;

    let orderCount = isOrderExists.length;

    await OrderSchema.updateMany(
      { batchNo: "" },
      { $set: { batchNo: batchNo } }
    );

    //------------------create data-------------------
    let dataCreated = await batchService.createNewData({
      batchNo: batchNo,
      orderCount: orderCount,
    });

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
// =============add  start end================

// =============all filter pagination api start================
exports.getFilterPagination = async (req, res) => {
  try {
    let dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.searchIn;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };
    // -----------------to send only active data on web-----------------
    if (req.path.includes("/app/") || req.path.includes("/app")) {
      matchQuery.$and.push({ isActive: true });
    }

    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue
    );
    // -----------------------------

    // ---------------check search keys valid-----------------

    let searchQueryCheck = checkInvalidParams(searchIn, searchKeys);

    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({
        ...searchQueryCheck,
      });
    }
    // ---------------------------------

    // ----------------get searchQuery-------------

    const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue);
    if (searchQuery && searchQuery.length) {
      matchQuery.$and.push({ $or: searchQuery });
    }
    // -------------------------------

    // ----------------------get range filter query--------------------
    const rangeQuery = getRangeQuery(rangeFilterBy);
    if (rangeQuery && rangeQuery.length) {
      matchQuery.$and.push(...rangeQuery);
    }
    // -------------------------------

    // ---------------get filter query---------------
    let booleanFields = [];
    let numberFileds = ["batchNo", "orderCount"];
    let objectIdFields = [];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFields
    );
    if (filterQuery && filterQuery.length) {
      matchQuery.$and.push(...filterQuery);
    }
    // ----------------------------------

    // ---------calander filter---------
    // ---------ToDo : for date filter---------

    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }
    //----------------calander filter----------
    //----------------------------

    // -------------for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array-----------
    let additionalQuery = [];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    // ------------------------------------------
    let dataFound = await batchService.aggregateQuery(finalAggregateQuery);
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let { limit, page, totalData, skip, totalPages } =
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
        totalPage: totalPages,
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
// =============all filter pagination api end================
