const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const orderService = require("../orderInquiry/OrderInquiryService");
const userService = require("../user/UserService");
const complaintService = require("../complain/ComplainService");

const { errorRes } = require("../../../utils/resError");

const { default: mongoose } = require("mongoose");
const {
  getDateFilterQuery,
  getLimitAndTotalCount,
} = require("../../helper/paginationFilterHelper");

//get api
exports.get = async (req, res) => {
  try {
    const { Id } = req.userData;
    //if no default query then pass {}
    let matchQuery = {
      assignDealerId: new mongoose.Types.ObjectId(Id),
      isDeleted: false,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ];

    let dataExist = await orderService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist?.length) {
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

// agent dashboard data

exports.getAgentDashboardData = async (req, res) => {
  try {
    const { Id } = req.userData;

    var dateFilter = req.body.dateFilter;
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

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    console.log(matchQuery, "matchQuery");

    // let complainAggrigation = finalAggregateQuery;
    // let inquiryAggrigation = finalAggregateQuery;
    // let orderAggrigation = finalAggregateQuery;
    // complainAggrigation.push({
    //   $match: {
    //     // isDeleted: false,
    //     isActive: true,
    //     complaintById: new mongoose.Types.ObjectId(Id),
    //   },
    // });
    console.log(finalAggregateQuery, "finalAggregateQuery");
    let numberOfComplaintCalls = await complaintService.findAllWithQuery(
      finalAggregateQuery
    );

    // inquiryAggrigation.push({
    //   agentId: Id,
    //   isActive: true,
    //   isDeleted: false,
    //   status: orderStatusEnum.inquiry,
    // })
    // let noOfInquiryCalls = await orderService.findAllWithQuery(inquiryAggrigation);

    // orderAggrigation.push({
    //   agentId: Id,
    //   isActive: true,
    //   isDeleted: false,
    //   status: orderStatusEnum.inquiry,
    // })
    // let noOfOrdersCalls = await orderService.findAllWithQuery(orderAggrigation);

    if (numberOfComplaintCalls?.length) {
      return res.status(200).send({
        numberOfComplaintCalls: numberOfComplaintCalls.length
          ? numberOfComplaintCalls.length
          : 0,
        // noOfInquiryCalls: noOfInquiryCalls?.length
        //   ? noOfInquiryCalls?.length
        //   : 0,
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
