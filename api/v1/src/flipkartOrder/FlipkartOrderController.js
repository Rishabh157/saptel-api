const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const flipkartOrderService = require("./FlipkartOrderService");
const { searchKeys } = require("./FlipkartOrderSchema");
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
const xlsx = require("xlsx");
const { getOrderNumber } = require("./FlipkartOrderHelper");

const limitConcurrency = async (items, limit, asyncFunc) => {
  const results = [];
  const executing = [];

  for (const item of items) {
    const promise = asyncFunc(item).then((result) => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });
    results.push(promise);
    executing.push(promise);

    // If the limit is reached, wait for one of the executing promises to finish
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
};
//add start

exports.add = async (req, res) => {
  try {
    // Read the uploaded Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!sheetData || sheetData.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Empty file or invalid data.");
    }

    // Get the starting order number
    let startingOrderNumber = await getOrderNumber();

    // Add orderNumber to each row
    const updatedSheetData = sheetData.map((row, index) => {
      return { ...row, orderNumber: startingOrderNumber + index };
    });

    // Replace the old sheet with the updated one
    workbook.Sheets[sheetName] = updatedSheet;

    // Function to handle individual row processing
    const processRow = async (row) => {
      let {
        order_item_id,
        order_id,
        fulfilment_source,
        fulfilment_type,
        order_date,
        order_approval_date,
        order_item_status,
        sku,
        fsn,
        product_title,
        quantity,
        pickup_logistics_partner,
        delivery_tracking_id,
        forward_logistics_form,
        forward_logistics_form_no,
        order_cancellation_date,
        cancellation_reason,
        cancellation_sub_reason,
        order_return_approval_date,
        return_id,
        return_reason,
        return_sub_reason,
        procurement_dispatch_sla,
        dispatch_after_date,
        dispatch_by_date,
        order_ready_for_dispatch_on_date,
        dispatched_date,
        dispatch_sla_breached,
        seller_pickup_reattempts,
        delivery_sla,
        deliver_by_date,
        order_delivery_date,
        delivery_sla_breached,
        order_service_completion_date,
        service_by_date,
        service_completion_sla,
        service_sla_breached,
        productCode,
        label,
        orderNumber, // Make sure this field is present in the row
        itemPrice,
      } = row;

      // Check for required fields
      if (
        !order_item_id ||
        !order_id ||
        !product_title ||
        !quantity ||
        !itemPrice
      ) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Missing required fields for row: ${JSON.stringify(row)}`
        );
      }

      // Check if the record already exists
      let dataExist = await flipkartOrderService.isExists([{ order_item_id }]);

      if (dataExist.exists && dataExist.existsSummary) {
        throw new ApiError(
          httpStatus.OK,
          `Duplicate record for order_item_id: ${order_item_id}`
        );
      }

      return flipkartOrderService.createNewData({
        companyId: req.userData.companyId,
        order_item_id,
        order_id,
        fulfilment_source,
        fulfilment_type,
        order_date,
        order_approval_date,
        order_item_status,
        sku,
        fsn,
        product_title,
        quantity,
        pickup_logistics_partner,
        delivery_tracking_id,
        forward_logistics_form,
        forward_logistics_form_no,
        order_cancellation_date,
        cancellation_reason,
        cancellation_sub_reason,
        order_return_approval_date,
        return_id,
        return_reason,
        return_sub_reason,
        procurement_dispatch_sla,
        dispatch_after_date,
        dispatch_by_date,
        order_ready_for_dispatch_on_date,
        dispatched_date,
        dispatch_sla_breached,
        seller_pickup_reattempts,
        delivery_sla,
        deliver_by_date,
        order_delivery_date,
        delivery_sla_breached,
        order_service_completion_date,
        service_by_date,
        service_completion_sla,
        service_sla_breached,
        productCode,
        label,
        orderNumber,
        itemPrice,
        isDispatched: false,
        status: "",
      });
    };

    // Process the sheet data with concurrency limit
    await limitConcurrency(updatedSheetData, 10, processRow);

    return res.status(httpStatus.CREATED).send({
      message: "All records added successfully.",
      status: true,
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
//update start
exports.update = async (req, res) => {
  try {
    let {
      companyId,
      order_item_id,
      order_id,
      fulfilment_source,
      fulfilment_type,
      order_date,
      order_approval_date,
      order_item_status,
      sku,
      fsn,
      product_title,
      quantity,
      pickup_logistics_partner,
      delivery_tracking_id,
      forward_logistics_form,
      forward_logistics_form_no,
      order_cancellation_date,
      cancellation_reason,
      cancellation_sub_reason,
      order_return_approval_date,
      return_id,
      return_reason,
      return_sub_reason,
      procurement_dispatch_sla,
      dispatch_after_date,
      dispatch_by_date,
      order_ready_for_dispatch_on_date,
      dispatched_date,
      dispatch_sla_breached,
      seller_pickup_reattempts,
      delivery_sla,
      deliver_by_date,
      order_delivery_date,
      delivery_sla_breached,
      order_service_completion_date,
      service_by_date,
      service_completion_sla,
      service_sla_breached,
      productCode,
      label,
    } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await flipkartOrderService.isExists([{ order_item_id }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------Find data-------------------
    let datafound = await flipkartOrderService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `FlipkartOrder not found.`);
    }

    let dataUpdated = await flipkartOrderService.getOneAndUpdate(
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
    let numberFileds = ["orderNumber"];
    let objectIdFields = ["companyId"];
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
    let additionalQuery = [];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await flipkartOrderService.aggregateQuery(
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

    let result = await flipkartOrderService.aggregateQuery(finalAggregateQuery);
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

    let dataExist = await flipkartOrderService.findAllWithQuery(matchQuery);

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
    let dataExist = await flipkartOrderService.getOneByMultiField({
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

//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await flipkartOrderService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await flipkartOrderService.getOneAndDelete({ _id });
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
    let dataExist = await flipkartOrderService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await flipkartOrderService.getOneAndUpdate(
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
