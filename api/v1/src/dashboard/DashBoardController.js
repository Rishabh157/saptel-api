const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const orderService = require("../orderInquiry/OrderInquiryService");
const dealerService = require("../dealer/DealerService");
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
const {
  orderStatusEnum,
  barcodeStatusType,
  userRoleType,
} = require("../../helper/enumUtils");
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

    if (complainAggrigationNewQuery) {
      complainAggrigation = [
        ...complainAggrigation,
        ...complainAggrigationNewQuery,
      ];
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

// get zm order summary

exports.getZmDashboard = async (req, res) => {
  try {
    const { Id, userRole } = req.userData;
    var dateFilter = req.body.dateFilter;
    let schemeId = req.body.schemeId;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    let dealerMatchQuery = {
      $and: [{ isDeleted: false }],
    };
    if (userRole === userRoleType.EXECUTIVEArea) {
      dealerMatchQuery.$and.push({
        zonalExecutiveAreaId: { $in: [new mongoose.Types.ObjectId(Id)] },
      });
    }
    if (userRole === userRoleType.srEXECUTIVEArea) {
      dealerMatchQuery.$and.push({
        zonalExecutiveId: new mongoose.Types.ObjectId(Id),
      });
    }

    if (
      userRole === userRoleType.srManagerDistribution ||
      userRole === userRoleType.avpDistribution ||
      userRole === userRoleType.managerArea
    ) {
      dealerMatchQuery.$and.push({
        zonalExecutiveId: { $ne: null },
        zonalManagerId: { $ne: null },
      });
    }

    let allDealersOfZm = await dealerService.aggregateQuery([
      {
        $match: dealerMatchQuery,
      },
    ]);
    let matchQuery = {
      $and: [],
    };
    if (schemeId !== null) {
      matchQuery.$and.push({ schemeId: new mongoose.Types.ObjectId(schemeId) });
    }

    if (allDealersOfZm?.length) {
      let allDealersID = allDealersOfZm?.map((ele) => {
        return new mongoose.Types.ObjectId(ele?._id);
      });
      let assignedOrder = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            ...datefilterQuery[0],
          },
        },
      ]);
      let backDatesOrder = 0;
      let deliveredOrder = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            status: orderStatusEnum.delivered,
            ...datefilterQuery[0],
          },
        },
      ]);
      let deliveryOutOfNetwork = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            status: orderStatusEnum.deliveryOutOfNetwork,
            ...datefilterQuery[0],
          },
        },
      ]);
      let holdOrder = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            status: orderStatusEnum.hold,
            ...datefilterQuery[0],
          },
        },
      ]);
      let inTransitOrder = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            status: orderStatusEnum.intransit,
            ...datefilterQuery[0],
          },
        },
      ]);
      let ndrOrder = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            status: orderStatusEnum.ndr,
            ...datefilterQuery[0],
          },
        },
      ]);
      let newOrder = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            status: orderStatusEnum.fresh,
            ...datefilterQuery[0],
          },
        },
      ]);
      let pndOrder = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            status: orderStatusEnum.pnd,
            ...datefilterQuery[0],
          },
        },
      ]);
      let postDatesOrderOrder = 0;
      let pscOrder = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            status: orderStatusEnum.psc,
            ...datefilterQuery[0],
          },
        },
      ]);
      let reAtteptOrder = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            status: orderStatusEnum.reattempt,
            ...datefilterQuery[0],
          },
        },
      ]);
      let unaOrder = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            status: orderStatusEnum.una,
            ...datefilterQuery[0],
          },
        },
      ]);
      let urgentOrder = await orderService?.aggregateQuery([
        {
          $match: {
            assignDealerId: { $in: allDealersID },
            status: orderStatusEnum.urgent,
            ...datefilterQuery[0],
          },
        },
      ]);
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: {
          assignedOrder: assignedOrder?.length,
          backDatesOrder: backDatesOrder?.length,
          deliveredOrder: deliveredOrder?.length,
          deliveryOutOfNetwork: deliveryOutOfNetwork?.length,
          holdOrder: holdOrder?.length,
          inTransitOrder: inTransitOrder?.length,
          ndrOrder: ndrOrder?.length,
          newOrder: newOrder?.length,
          pndOrder: pndOrder?.length,
          postDatesOrderOrder: postDatesOrderOrder?.length,
          pscOrder: pscOrder?.length,
          reAtteptOrder: reAtteptOrder?.length,
          unaOrder: unaOrder?.length,
          urgentOrder: urgentOrder?.length,
        },
        code: "OK",
        issue: null,
      });
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: null,
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

// get zm dealer summary]

exports.getZmDealerSummaray = async (req, res) => {
  try {
    const { Id, userRole } = req.userData;
    var dateFilter = req.body.dateFilter;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];
    let dealerMatchQuery = {
      $and: [{ isDeleted: false }],
    };
    if (userRole === userRoleType.EXECUTIVEArea) {
      dealerMatchQuery.$and.push({
        zonalExecutiveAreaId: { $in: [new mongoose.Types.ObjectId(Id)] },
      });
    }
    if (userRole === userRoleType.srEXECUTIVEArea) {
      dealerMatchQuery.$and.push({
        zonalExecutiveId: new mongoose.Types.ObjectId(Id),
      });
    }

    if (
      userRole === userRoleType.srManagerDistribution ||
      userRole === userRoleType.avpDistribution ||
      userRole === userRoleType.managerArea
    ) {
      dealerMatchQuery.$and.push({
        zonalExecutiveId: { $ne: null },
        zonalManagerId: { $ne: null },
      });
    }

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      dealerMatchQuery.$and.push(...datefilterQuery);
    }
    console.log(dealerMatchQuery, "dealerMatchQuery");

    let allDealersOfZm = await dealerService.aggregateQuery([
      {
        $match: dealerMatchQuery,
      },
      {
        $lookup: {
          from: "orderinquiries", // Assuming the name of the order collection is "orderInquiry"
          localField: "_id",
          foreignField: "assignDealerId",
          as: "orders",
        },
      },
      {
        $addFields: {
          lastAssignedOrder: {
            $arrayElemAt: ["$orders.createdAt", -1], // Get the last element of the "date" array
          },
          totalOrders: {
            $size: {
              $filter: {
                input: "$orders",
                as: "order",
                cond: {
                  $in: [
                    "$$order.status",
                    [
                      orderStatusEnum.delivered,
                      orderStatusEnum.doorCancelled,
                      orderStatusEnum.hold,
                    ],
                  ],
                },
              },
            },
          },
          holdOrders: {
            $reduce: {
              input: "$orders",
              initialValue: 0,
              in: {
                $cond: {
                  if: { $eq: ["$$this.status", orderStatusEnum.hold] },
                  then: { $add: ["$$value", 1] },
                  else: "$$value",
                },
              },
            },
          },
          deliveredOrders: {
            $sum: {
              $cond: [
                { $eq: ["$orders.status", orderStatusEnum.delivered] },
                1,
                0,
              ],
            },
          },
          cancelOrders: {
            $sum: {
              $cond: [
                { $eq: ["$orders.status", orderStatusEnum.doorCancelled] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          lastAssignedOrder: {
            $subtract: [
              new Date(),
              { $ifNull: ["$lastAssignedOrder", new Date()] }, // If no orders found, return today's date
            ],
          },
          lastAssignedOrderInDays: {
            $round: {
              $divide: [
                {
                  $subtract: [
                    new Date(),
                    { $ifNull: ["$lastAssignedOrder", new Date()] },
                  ],
                },
                1000 * 60 * 60 * 24, // Convert milliseconds to days
              ],
            },
          },
          deliveryPercent: {
            $cond: [
              { $gt: ["$totalOrders", 0] }, // Check if totalOrders is greater than 0
              {
                $multiply: [
                  { $divide: ["$deliveredOrders", "$totalOrders"] },
                  100,
                ],
              },
              0, // If totalOrders is 0, set deliveryPercent to 0
            ],
          },
          holdPercent: {
            $cond: [
              { $gt: ["$totalOrders", 0] }, // Check if totalOrders is greater than 0
              {
                $multiply: [{ $divide: ["$holdOrders", "$totalOrders"] }, 100],
              },
              0, // If totalOrders is 0, set holdPercent to 0
            ],
          },
          cancelPercent: {
            $cond: [
              { $gt: ["$totalOrders", 0] }, // Check if totalOrders is greater than 0
              {
                $multiply: [
                  { $divide: ["$cancelOrders", "$totalOrders"] },
                  100,
                ],
              },
              0, // If totalOrders is 0, set cancelPercent to 0
            ],
          },
        },
      },
      {
        $project: {
          lastAssignedOrderInDays: 1,

          totalOrders: 1,
          holdOrders: 1,
          deliveredOrders: 1,
          cancelOrders: 1,
          deliveryPercent: 1,
          holdPercent: 1,
          cancelPercent: 1,
          dealerCode: 1,
        },
      },
    ]);
    console.log(allDealersOfZm, "allDealersOfZm");
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: allDealersOfZm,
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

// get zm dealer stock

exports.getZmDealerStock = async (req, res) => {
  try {
    const { Id, userRole } = req.userData;
    var dateFilter = req.body.dateFilter;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];
    let dealerMatchQuery = {
      $and: [{ isDeleted: false }],
    };
    if (userRole === userRoleType.EXECUTIVEArea) {
      dealerMatchQuery.$and.push({
        zonalExecutiveAreaId: { $in: [new mongoose.Types.ObjectId(Id)] },
      });
    }
    if (userRole === userRoleType.srEXECUTIVEArea) {
      dealerMatchQuery.$and.push({
        zonalExecutiveId: new mongoose.Types.ObjectId(Id),
      });
    }

    if (
      userRole === userRoleType.srManagerDistribution ||
      userRole === userRoleType.avpDistribution ||
      userRole === userRoleType.managerArea
    ) {
      dealerMatchQuery.$and.push({
        zonalExecutiveId: { $ne: null },
        zonalManagerId: { $ne: null },
      });
    }
    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      dealerMatchQuery.$and.push(...datefilterQuery);
    }

    let allDealersStocks = await dealerService.aggregateQuery([
      {
        $match: dealerMatchQuery,
      },
      {
        $lookup: {
          from: "barcodes", // Assuming the name of the barcode collection is "barcode"
          localField: "_id",
          foreignField: "dealerId",
          as: "stock",
        },
      },
      {
        $lookup: {
          from: "salesorders",
          localField: "_id",
          foreignField: "dealerId",
          as: "salesOrder",
        },
      },
      {
        $lookup: {
          from: "dtwmasters",
          localField: "_id",
          foreignField: "dealerId",
          as: "dtwData",
        },
      },
      {
        $addFields: {
          stockAvailable: {
            $size: {
              $filter: {
                input: "$stock",
                as: "barcode",
                cond: {
                  $eq: [
                    "$$barcode.status",
                    barcodeStatusType.atDealerWarehouse,
                  ],
                },
              },
            },
          },
          intransiteStock: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$salesOrder",
                    as: "order",
                    cond: { $eq: ["$$order.status", "DISPATCHED"] }, // Filter sales orders with status COMPLETE
                  },
                },
                as: "order",
                in: { $sum: "$$order.productSalesOrder.quantity" }, // Sum the quantities of productSalesOrder
              },
            },
          },
          rtoStock: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$dtwData",
                    as: "dtw",
                    cond: { $eq: ["$$dtw.status", "COMPLETE"] }, // Filter sales dtws with status COMPLETE
                  },
                },
                as: "dtw",
                in: { $sum: "$$dtw.productSalesOrder.quantity" }, // Sum the quantities of productSalesOrder
              },
            },
          },
        },
      },
      {
        $project: {
          dealerCode: 1,
          stockAvailable: 1,
          intransiteStock: 1,
          rtoStock: 1,
        },
      },
    ]);
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: allDealersStocks,
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
