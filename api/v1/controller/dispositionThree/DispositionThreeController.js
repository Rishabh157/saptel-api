const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const dispositionThreeService = require("../../services/DispositionThreeService");
const { searchKeys } = require("../../model/DispositionTwoSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const dispositionOneService = require("../../services/DispositionOneService");
const dispositionTwoService = require("../../services/DispositionTwoService");
const companyService = require("../../services/CompanyService");

const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const mongoose = require("mongoose");

// ============= add Disposition start  ================
exports.add = async (req, res) => {
  try {
    let { dispositionName, dispositionOneId, dispositionTwoId, companyId } =
      req.body;

    const isDispositionOneExists = await dispositionOneService.findCount({
      _id: dispositionOneId,
      isDeleted: false,
    });
    if (!isDispositionOneExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition One");
    }

    const isDispositionTwoExists = await dispositionTwoService.findCount({
      _id: dispositionTwoId,
      isDeleted: false,
    });
    if (!isDispositionTwoExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Two");
    }

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    // -----------------------check duplicate exist --------------------
    let dataExist = await dispositionThreeService.isExists([
      { dispositionName },
    ]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    // ----------------------create data-------------------------
    let dataCreated = await dispositionThreeService.createNewData({
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
