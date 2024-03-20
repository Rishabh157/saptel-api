const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const moneyBackRequestLogService = require("./MoneyBackRequestLogService");
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
const { default: mongoose } = require("mongoose");

//get api
exports.get = async (req, res) => {
  try {
    //if no default query then pass {}
    const { moneyBackRequestId } = req.params;
    let matchQuery = {
      isDeleted: false,
      moneyBackRequestId: new mongoose.Types.ObjectId(moneyBackRequestId),
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "managerFirstUserId",
          foreignField: "_id",
          as: "managerFirstData",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "managerSecondUserId",
          foreignField: "_id",
          as: "managerSecondData",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "accoutUserId",
          foreignField: "_id",
          as: "accData",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },

      {
        $addFields: {
          managerFirstLabel: {
            $concat: [
              { $arrayElemAt: ["$managerFirstData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$managerFirstData.lastName", 0] },
            ],
          },
          managerSecondtLabel: {
            $concat: [
              { $arrayElemAt: ["$managerSecondData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$managerSecondData.lastName", 0] },
            ],
          },
          ccLabel: {
            $concat: [
              { $arrayElemAt: ["$ccData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$ccData.lastName", 0] },
            ],
          },
          accLabel: {
            $concat: [
              { $arrayElemAt: ["$accData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$accData.lastName", 0] },
            ],
          },
        },
      },
      {
        $unset: ["managerFirstData", "managerSecondData", "ccData", "accData"],
      },
    ];

    let dataExist = await moneyBackRequestLogService.aggregateQuery(
      additionalQuery
    );

    if (!dataExist.length) {
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
