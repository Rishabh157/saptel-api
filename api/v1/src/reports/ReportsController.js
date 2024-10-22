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
const {
  checkInvalidParams,
  getSearchQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const { default: mongoose } = require("mongoose");
const {
  orderStatusEnum,
  userEnum,
  moduleType,
  actionType,
  userRoleType,
} = require("../../helper/enumUtils");
const {
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const { searchKeys } = require("../orderInquiry/OrderInquirySchema");

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

exports.allInquiryFilterPagination = async (req, res) => {
  try {
    const { Id } = req.userData;

    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;

    let searchIn = req.body.searchIn;

    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];

    const isUserExists = await userService.getOneByMultiField({
      _id: Id,
      isDeleted: false,
      isActive: true,
    });

    if (!isUserExists) {
      throw new ApiError(httpStatus.OK, "Invalid Agent ");
    }
    let matchQuery = {
      $and: [],
    };

    if (isUserExists.userType === userEnum.admin) {
      matchQuery.$and.push({ orderNumber: null });
    } else {
      matchQuery.$and.push({
        orderNumber: null,
        agentId: new mongoose.Types.ObjectId(Id),
      });
    }

    /**
     * check search keys valid
     **/

    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue
    );

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

    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    // const datefilterQuery = await getDateFilterQuery(
    //   dateFilter,
    //   allowedDateFiletrKeys
    // );
    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );

    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }
    //

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        await orderInquiryService.findCount(matchQuery),
        req.body.isPaginationRequired
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }
    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
      {
        $lookup: {
          from: "callcentermasters",
          localField: "callCenterId",
          foreignField: "_id",
          as: "callcenterdata",
          pipeline: [
            {
              $project: {
                callCenterName: 1,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "deliveryboys",
          localField: "delivery_boy_id",
          foreignField: "_id",
          as: "deleivery_by_data",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "didmanagements",
          localField: "didNo",
          foreignField: "didNumber",
          as: "did_data",
          pipeline: [
            {
              $lookup: {
                from: "channelmasters",
                localField: "channelId",
                foreignField: "_id",
                as: "channel_data",
                pipeline: [
                  {
                    $project: {
                      channelName: 1,
                    },
                  },
                ],
              },
            },
          ],
        },
      },

      {
        $addFields: {
          channelLabel: {
            $arrayElemAt: ["$did_data.channel_data.channelName", 0],
          },

          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
          },

          callCenterLabel: {
            $arrayElemAt: ["$callcenterdata.callCenterName", 0],
          },
        },
      },

      {
        $unset: ["did_data", "callcenterdata", "deleivery_by_data"],
      },
    ];
    // let additionalQuery = [];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await orderInquiryService.aggregateQuery(
      finalAggregateQuery
    );
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.order,
      userRoleData,
      actionType.pagination
    );
    let result = await orderInquiryService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(200).send({
        data: allowedFields,
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
