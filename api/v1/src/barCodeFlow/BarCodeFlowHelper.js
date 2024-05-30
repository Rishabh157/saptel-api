const mongoose = require("mongoose");
const httpStatus = require("http-status");
const logger = require("../../../../config/logger");
const { errorRes } = require("../../../utils/resError");
const ApiError = require("../../../utils/apiErrorUtils");
const barCodeFlowService = require("./BarCodeFlowService");

const addToBarcodeFlow = async (barcode) => {
  try {
    barcode = JSON.parse(JSON.stringify(barcode));

    delete barcode._id;

    let addbarcodeLog = await barCodeFlowService.createNewData({
      ...barcode,
    });
    if (!addbarcodeLog) {
      throw new ApiError(httpStatus.OK, "Something went wrong..");
    }
    return {
      message: "barcode request flow created.",
      code: httpStatus.OK,
      issue: null,
      data: addbarcodeLog,
      status: true,
    };
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return {
      message: message,
      code: errData.statusCode,
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    };
  }
};
module.exports = {
  addToBarcodeFlow,
};
