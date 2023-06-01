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

    console.log(orderCount);
    console.log(batchNo);

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
