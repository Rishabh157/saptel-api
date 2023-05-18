const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const dispositionTwoService = require("../../services/DispositionTwoService");
const dispositionOneService = require("../../services/DispositionOneService");
const { searchKeys } = require("../../model/DispositionTwoSchema");
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

// ============= add Disposition start  ================
exports.add = async (req, res) => {
  try {
    let { dispositionName, dispositionOneId, companyId } = req.body;

    // -----------------------check duplicate exist --------------------
    let dataExist = await dispositionTwoService.isExists([{ dispositionName }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    // ----------------------create data-------------------------
    let dataCreated = await dispositionTwoService.createNewData({
      ...req.body,
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
// =============add Disposition start end================

// =============update Disposition start================
exports.update = async (req, res) => {
  try {
    let { dispositionName, dispositionOneId, companyId } = req.body;

    let idToBeSearch = req.params.id;
    // ------------------------ find data ---------------------
    let dataFound = await dispositionTwoService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!dataFound) {
      throw new ApiError(httpStatus.OK, `DispositionOne not found.`);
    }

    let dataUpdated = await dispositionTwoService.getOneAndUpdate(
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
// =============update Disposition end================

// =============get Disposition start================
exports.get = async (req, res) => {
  try {
    //if no default query then pass {}
    let matchQuery = { isDeleted: false };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let dataExist = await dispositionTwoService.findAllWithQuery(matchQuery);

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
// =============update Disposition start end================

// =============get all DispositionTwo by Id of DispositionOne Id start================
exports.getByDispositionOneId = async (req, res) => {
  try {
    let { dispositionOneId } = req.body;
    console.log(dispositionOneId);

    let dataExist = await dispositionTwoService.findAllWithQuery({
      dispositionOneId,
    });

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
// =============get all DispositionTwo by Id of DispositionOne Id start end================

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

// =============statusChange  start================
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await dispositionTwoService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await dispositionTwoService.getOneAndUpdate(
      {
        _id,
      },
      {
        isActive,
      }
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
// =============statusChange start end================
