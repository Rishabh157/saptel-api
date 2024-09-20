const mongoose = require("mongoose");
const httpStatus = require("http-status");
const logger = require("../../../../config/logger");
const { errorRes } = require("../../../utils/resError");
const ApiError = require("../../../utils/apiErrorUtils");
const orderFlowService = require("./OrderInquiryFlowService");

const addToOrderFlow = async (
  orderId,
  orderReferenceNumber,
  remark,
  status,
  createdBy
) => {
  try {
    let addOrderLog = await orderFlowService.createNewData({
      orderId,
      orderReferenceNumber,
      remark,
      status,
      createdBy,
    });
    if (!addOrderLog) {
      throw new ApiError(httpStatus.OK, "Something went wrong..");
    }
    return {
      message: "Order request flow created.",
      code: httpStatus.OK,
      issue: null,
      data: addOrderLog,
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
  addToOrderFlow,
};
