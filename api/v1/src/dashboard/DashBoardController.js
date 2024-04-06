const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const orderService = require("../orderInquiry/OrderInquiryService");
const userService = require("../user/UserService");
const complaintService = require("../complain/ComplainService");
const houseArrestService = require("../houseArrestRequest/HouseArrestRequestService");
const moneyBackService = require("../moneyBackRequest/MoneyBackRequestService");
const productReplacementService = require("../productReplacementRequest/ProductReplacementRequestService");

const { errorRes } = require("../../../utils/resError");

const { default: mongoose } = require("mongoose");
const {
  getDateFilterQuery,
  getLimitAndTotalCount,
} = require("../../helper/paginationFilterHelper");
const { orderStatusEnum } = require("../../helper/enumUtils");
const {
  getQuery,
  getQueryForComplaint,
  getQueryForhouseArrest,
  getQueryFormoneyBack,
  getQueryForreplacement,
  getQueryForinquiry,
  getQueryFororder,
} = require("./DashBoardHelper");

//get api
exports.get = async (req, res) => {
  try {
    const { Id } = req.userData;
    //if no default query then pass {}
    let matchQuery = {
      assignDealerId: new mongoose.Types.ObjectId(Id),
      isDeleted: false,
    };
    // if (req.query && Object.keys(req.query).length) {
    //   matchQuery = getQuery(matchQuery, req.query);
    // }
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

    let complainAggrigation = [...finalAggregateQuery];
    let houseArrestAggrigation = [...finalAggregateQuery];
    let moneyBackAggrigation = [...finalAggregateQuery];
    let replacementAggrigation = [...finalAggregateQuery];
    let inquiryAggrigation = [...finalAggregateQuery];
    let orderAggrigation = [...finalAggregateQuery];

    // complaint
    let complainAggrigationNewQuery = await getQueryForComplaint(
      isUserExists?.userRole,
      Id
    );
    console.log(complainAggrigationNewQuery, "complainAggrigationNewQuery");

    if (complainAggrigationNewQuery) {
      complainAggrigation = [
        ...complainAggrigation,
        ...complainAggrigationNewQuery,
      ];
      console.log(complainAggrigation, "complainAggrigation");
      var numberOfComplaintCalls = await complaintService.aggregateQuery(
        complainAggrigation
      );
    }
    //houseArrest

    let houseArrestAggrigationNewQuery = await getQueryForhouseArrest(
      isUserExists?.userRole,
      Id
    );
    if (houseArrestAggrigationNewQuery) {
      houseArrestAggrigation = [
        ...houseArrestAggrigation,
        ...houseArrestAggrigationNewQuery,
      ];
      var numberOfHouseArrestCase = await houseArrestService.aggregateQuery(
        houseArrestAggrigation
      );
    }

    //money back

    let moneyBackAggrigationNewQuery = await getQueryFormoneyBack(
      isUserExists?.userRole,
      Id
    );
    if (moneyBackAggrigationNewQuery) {
      moneyBackAggrigation = [
        ...moneyBackAggrigation,
        ...moneyBackAggrigationNewQuery,
      ];
      var numberOfMoneyBackCase = await moneyBackService.aggregateQuery(
        moneyBackAggrigation
      );
    }

    // product replacement

    let replacementAggrigationNewQuery = await getQueryForreplacement(
      isUserExists?.userRole,
      Id
    );
    if (replacementAggrigationNewQuery) {
      replacementAggrigation = [
        ...replacementAggrigation,
        ...replacementAggrigationNewQuery,
      ];
      var numberOfProductReplacementCase =
        await productReplacementService.aggregateQuery(replacementAggrigation);
    }
    // inquiry

    let inquiryAggrigationNewQuery = await getQueryForinquiry(
      isUserExists?.userRole,
      Id
    );
    if (inquiryAggrigationNewQuery) {
      inquiryAggrigation = [
        ...inquiryAggrigation,
        ...inquiryAggrigationNewQuery,
      ];
      var noOfInquiryCalls = await orderService.aggregateQuery(
        inquiryAggrigation
      );
    }

    // total orders

    let orderAggrigationNewQuery = await getQueryFororder(
      isUserExists?.userRole,
      Id
    );
    if (orderAggrigationNewQuery) {
      orderAggrigation = [...orderAggrigation, ...orderAggrigationNewQuery];
      var noOfOrdersCalls = await orderService.aggregateQuery(orderAggrigation);
    }
    return res.status(200).send({
      numberOfComplaintCalls: numberOfComplaintCalls?.length
        ? numberOfComplaintCalls?.length
        : 0,
      noOfInquiryCalls: noOfInquiryCalls?.length ? noOfInquiryCalls?.length : 0,
      noOfOrdersCalls: noOfOrdersCalls?.length ? noOfOrdersCalls?.length : 0,
      numberOfHouseArrestCase: numberOfHouseArrestCase?.length
        ? numberOfHouseArrestCase?.length
        : 0,
      numberOfMoneyBackCase: numberOfMoneyBackCase?.length
        ? numberOfMoneyBackCase?.length
        : 0,
      numberOfProductReplacementCase: numberOfProductReplacementCase?.length
        ? numberOfProductReplacementCase?.length
        : 0,
      status: true,
      message: "Data Found",
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
