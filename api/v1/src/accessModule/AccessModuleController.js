const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const accessmoduleService = require("./AccessModuleService");
const { searchKeys } = require("./AccessModuleSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const accessModuleHelper = require("./AccessModuleHelper");

const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");

//add start
exports.add = async (req, res) => {
  try {
    let {
      route,
      method,
      actionName,
      actionDisplayName,
      actionDisplayRank,
      modelName,
      modelDisplayName,
      modelDisplayRank,
      featureName,
      featureRank,
      fields,
    } = req.body;

    /**
     * check valid data
     */

    let isMethodActionValid = await accessModuleHelper.isActionMethodValid(
      actionName,
      method
    );
    if (!isMethodActionValid) {
      throw new ApiError(
        httpStatus.OK,
        `Either action ${actionName} is invalid or its method ${method}.`
      );
    }

    let collectionFound = await accessModuleHelper.checkBodyData(
      modelName,
      fields
    );
    if (!collectionFound.status) {
      throw new ApiError(httpStatus.OK, `${collectionFound.message}`);
    }

    let dataExist = await accessmoduleService.isExists(
      [{ actionName }, { modelName }],
      false,
      true
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    let actionDisplayNameExist = await accessmoduleService.isExists(
      [{ actionDisplayName }, { modelName }],
      false,
      true
    );
    if (actionDisplayNameExist.exists && actionDisplayNameExist.existsSummary) {
      throw new ApiError(httpStatus.OK, actionDisplayNameExist.existsSummary);
    }

    let routemethodExist = await accessmoduleService.isExists(
      [{ route }, { method }],
      false,
      true
    );
    if (routemethodExist.exists && routemethodExist.existsSummary) {
      throw new ApiError(httpStatus.OK, routemethodExist.existsSummary);
    }
    let actionNamemodelNameExist = await accessmoduleService.isExists(
      [{ actionDisplayRank }, { modelName }],
      false,
      true
    );
    if (
      actionNamemodelNameExist.exists &&
      actionNamemodelNameExist.existsSummary
    ) {
      throw new ApiError(httpStatus.OK, actionNamemodelNameExist.existsSummary);
    }
    let modelfound = await accessmoduleService.getOneByMultiField({
      modelName: modelName,
    });
    if (modelfound && modelfound.modelDisplayRank !== modelDisplayRank) {
      throw new ApiError(
        httpStatus.OK,
        "model rank must be same in it's all module"
      );
    }
    if (modelfound && modelfound.modelDisplayName !== modelDisplayName) {
      throw new ApiError(
        httpStatus.OK,
        "model display name must be same in it's all module"
      );
    }
    let featurefound = await accessmoduleService.getOneByMultiField({
      featureName: featureName,
    });
    if (featurefound && featurefound.featureRank !== featureRank) {
      throw new ApiError(
        httpStatus.OK,
        "feature rank must be same in it's all module"
      );
    }

    //------------------create data-------------------
    let dataCreated = await accessmoduleService.createNewData({ ...req.body });

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
    let idToBeSearch = req.params.id;

    let {
      route,
      method,
      actionName,
      actionDisplayName,
      actionDisplayRank,
      modelName,
      modelDisplayName,
      modelDisplayRank,
      featureName,
      featureRank,
      fields,
    } = req.body;

    /**
     * check valid data
     */

    let isMethodActionValid = await accessModuleHelper.isActionMethodValid(
      actionName,
      method
    );
    if (!isMethodActionValid) {
      throw new ApiError(
        httpStatus.OK,
        `Either action ${actionName} is invalid or its method ${method}.`
      );
    }

    let collectionFound = await accessModuleHelper.checkBodyData(
      modelName,
      fields
    );
    if (!collectionFound.status) {
      throw new ApiError(httpStatus.OK, `${collectionFound.message}`);
    }

    let dataExist = await accessmoduleService.isExists(
      [{ actionName }, { modelName }],
      false,
      true
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    let actionDisplayNameExist = await accessmoduleService.isExists(
      [{ actionDisplayName }, { modelName }],
      false,
      true
    );
    if (actionDisplayNameExist.exists && actionDisplayNameExist.existsSummary) {
      throw new ApiError(httpStatus.OK, actionDisplayNameExist.existsSummary);
    }

    let routemethodExist = await accessmoduleService.isExists(
      [{ route }, { method }],
      false,
      true
    );
    if (routemethodExist.exists && routemethodExist.existsSummary) {
      throw new ApiError(httpStatus.OK, routemethodExist.existsSummary);
    }
    let actionNamemodelNameExist = await accessmoduleService.isExists(
      [{ actionDisplayRank }, { modelName }],
      false,
      true
    );
    if (
      actionNamemodelNameExist.exists &&
      actionNamemodelNameExist.existsSummary
    ) {
      throw new ApiError(httpStatus.OK, actionNamemodelNameExist.existsSummary);
    }
    let modelfound = await accessmoduleService.getOneByMultiField({
      modelName: modelName,
    });
    if (modelfound && modelfound.modelDisplayRank !== modelDisplayRank) {
      throw new ApiError(
        httpStatus.OK,
        "model rank must be same in it's all module"
      );
    }
    if (modelfound && modelfound.modelDisplayName !== modelDisplayName) {
      throw new ApiError(
        httpStatus.OK,
        "model display name must be same in it's all module"
      );
    }
    let featurefound = await accessmoduleService.getOneByMultiField({
      featureName: featureName,
    });
    if (featurefound && featurefound.featureRank !== featureRank) {
      throw new ApiError(
        httpStatus.OK,
        "feature rank must be same in it's all module"
      );
    }
    //------------------Find data-------------------
    let datafound = await accessmoduleService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Accessmodule not found.`);
    }

    let dataUpdated = await accessmoduleService.getOneAndUpdate(
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
    let errData = await errorRes(err);
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
    let numberFileds = ["actionName", "action", "route", "method"];

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
    let additionalQuery = [];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await accessmoduleService.aggregateQuery(
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

    let result = await accessmoduleService.aggregateQuery(finalAggregateQuery);
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
    let matchQuery = { isDeleted: false };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let dataExist = await accessmoduleService.findAllWithQuery(matchQuery);

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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await accessmoduleService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await accessmoduleService.getOneAndDelete({ _id });
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
    let dataExist = await accessmoduleService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await accessmoduleService.getOneAndUpdate(
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
