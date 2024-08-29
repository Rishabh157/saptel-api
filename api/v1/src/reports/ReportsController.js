const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const userService = require("../user/UserService");
const callCenterService = require("../callCenterMaster/CallCenterMasterService");
const schemeService = require("../scheme/SchemeService");
const complaintService = require("../complain/ComplainService");
const { errorRes } = require("../../../utils/resError");

const orderInquiryService = require("../orderInquiry/OrderInquiryService");
const { getDateFilterQuery } = require("../../helper/paginationFilterHelper");
const { default: mongoose } = require("mongoose");
const { orderStatusEnum } = require("../../helper/enumUtils");

exports.agentOrderStatus = async (req, res) => {
  try {
    const { callCenterId, agentId, dateFilter } = req.body;
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      console.log(datefilterQuery, "datefilterQuery");
      matchQuery.$and.push(...datefilterQuery);
    }
    const isCallCenterExists = await callCenterService.findCount({
      _id: callCenterId,
      isDeleted: false,
      isActive: true,
    });
    if (!isCallCenterExists) {
      throw new ApiError(httpStatus.OK, "Invalid Call center");
    }

    const agentExists = await userService.getOneByMultiField({
      _id: agentId,
      isDeleted: false,
      isActive: true,
    });
    if (!agentExists) {
      throw new ApiError(httpStatus.OK, "Invalid Agent");
    }

    if (req.path.includes("/app/") || req.path.includes("/app")) {
      matchQuery.$and.push({ isActive: true });
    }

    //----------------------------
    // Prepare aggregation pipeline
    const statuses = [
      orderStatusEnum.fresh,
      orderStatusEnum.all,
      orderStatusEnum.prepaid,
      orderStatusEnum.delivered,
      orderStatusEnum.doorCancelled,
      orderStatusEnum.hold,
      orderStatusEnum.psc,
      orderStatusEnum.una,
      orderStatusEnum.pnd,
      orderStatusEnum.urgent,
      orderStatusEnum.nonAction,
      orderStatusEnum.rto,
      orderStatusEnum.inquiry,
      orderStatusEnum.reattempt,
      orderStatusEnum.deliveryOutOfNetwork,
      orderStatusEnum.intransit,
      orderStatusEnum.ndr,
      orderStatusEnum.closed,
      orderStatusEnum.cancel,
    ];

    let pipeline = [
      {
        $match: {
          ...matchQuery,
          agentName: agentExists.userName,
        },
      },
      {
        $group: {
          _id: { schemeName: "$schemeName", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.schemeName",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          schemeName: "$_id",
          ...statuses.reduce((acc, status) => {
            acc[status] = {
              $let: {
                vars: {
                  matchedStatus: {
                    $filter: {
                      input: "$statuses",
                      as: "stat",
                      cond: { $eq: ["$$stat.status", status] },
                    },
                  },
                },
                in: {
                  $cond: {
                    if: { $gt: [{ $size: "$$matchedStatus" }, 0] },
                    then: { $arrayElemAt: ["$$matchedStatus.count", 0] },
                    else: 0,
                  },
                },
              },
            };
            return acc;
          }, {}),
        },
      },
    ];

    let result = await orderInquiryService.aggregateQuery(pipeline);
    console.log(result, "result");
    if (result?.length) {
      return res.status(httpStatus.OK).send({
        data: result,
        status: true,
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

exports.agentWiseComplaint = async (req, res) => {
  try {
    const { schemeId, agentId, dateFilter } = req.body;
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      console.log(datefilterQuery, "datefilterQuery");
      matchQuery.$and.push(...datefilterQuery);
    }

    if (schemeId !== null) {
      const isSchemeExists = await schemeService.findCount({
        _id: schemeId,
        isDeleted: false,
        isActive: true,
      });
      if (!isSchemeExists) {
        throw new ApiError(httpStatus.OK, "Invalid Scheme");
      } else {
        matchQuery.$and.push({
          schemeId: new mongoose.Types.ObjectId(schemeId),
        });
      }
    }

    if (agentId !== null) {
      const agentExists = await userService.getOneByMultiField({
        _id: agentId,
        isDeleted: false,
        isActive: true,
      });
      if (!agentExists) {
        throw new ApiError(httpStatus.OK, "Invalid Agent");
      } else {
        matchQuery.$and.push({
          complaintById: new mongoose.Types.ObjectId(agentId),
        });
      }
    }

    if (req.path.includes("/app/") || req.path.includes("/app")) {
      matchQuery.$and.push({ isActive: true });
    }

    //----------------------------
    // Prepare aggregation pipeline

    let result = await complaintService.aggregateQuery([
      {
        $match: matchQuery,
      },
    ]);
    if (result?.length) {
      return res.status(httpStatus.OK).send({
        data: result,
        status: true,
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
