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
const salesOrderService = require("../salesOrder/SalesOrderService");
const rtvService = require("../rtvMaster/RtvMasterService");
const wtwService = require("../warehouseToWarehouse/wtwMasterService");
const wtsService = require("../warehouseToSample/wtsMasterService");
const wtcService = require("../warehouseToCompany/wtcMasterService");
const dtwService = require("../dealerToWarehouse/dtwMasterService");
const barCodeService = require("../barCode/BarCodeService");
const dealerPincodeService = require("../dealerPincode/DealerPincodeService");

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
  productStatus,
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

// get warehouse inventory data

exports.getWhDashboardInventory = async (req, res) => {
  try {
    const { wid } = req.params;
    let additionalQuery = [
      {
        $match: {
          isUsed: true, // You can add any additional match criteria here if needed
          status: barcodeStatusType.atWarehouse,
          companyId: new mongoose.Types.ObjectId(req.userData.companyId),
          wareHouseId: new mongoose.Types.ObjectId(wid),
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },

      {
        $group: {
          _id: {
            wareHouseId: `$${wid}`,
            productGroupId: `$productGroupId`,
          },
          productGroupLabel: { $first: "$productGroupLabel" },
          count: { $sum: 1 }, // Count the documents in each group
          firstDocument: { $first: "$$ROOT" }, // Get the first document in each group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          wareHouseId: "$_id.wareHouseId",
          // productGroupId: "$_id.productGroupId",
          count: 1, // Include the count field
          // firstDocument: 1, // Include the firstDocument field
          productGroupLabel: 1,
          wareHouseLabel: 1,
        },
      },
    ];

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(additionalQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: dataFound,
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

// get warehouse dashboard outward stock data count

exports.getWhOutwardStock = async (req, res) => {
  try {
    const { wid } = req.params;
    var dateFilter = req.body.dateFilter;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    //-----------------------------------
    let stockToDealer = await salesOrderService.aggregateQuery([
      {
        $match: {
          companyWareHouseId: new mongoose.Types.ObjectId(wid),
          // status: productStatus.notDispatched,
          isDeleted: false,
          ...datefilterQuery[0],
        },
      },
    ]);
    //-----------------------------------
    let stockToCustomer = await orderService.aggregateQuery([
      {
        $match: {
          assignWarehouseId: new mongoose.Types.ObjectId(wid),
          firstCallApproval: true,
          isDeleted: false,
          ...datefilterQuery[0],
        },
      },
    ]);
    //-----------------------------------
    let stockTortv = await rtvService.aggregateQuery([
      {
        $match: {
          warehouseId: new mongoose.Types.ObjectId(wid),
          secondApproved: true,
          isDeleted: false,
          ...datefilterQuery[0],
        },
      },
    ]);
    //-----------------------------------
    let stockToWarehouse = await wtwService.aggregateQuery([
      {
        $match: {
          fromWarehouseId: new mongoose.Types.ObjectId(wid),
          secondApproved: true,
          isDeleted: false,
          ...datefilterQuery[0],
        },
      },
    ]);
    //-----------------------------------
    let stockToSample = await wtsService.aggregateQuery([
      {
        $match: {
          fromWarehouseId: new mongoose.Types.ObjectId(wid),
          status: productStatus.notDispatched,
          isDeleted: false,
          ...datefilterQuery[0],
        },
      },
    ]);
    //-----------------------------------
    let stockToCompany = await wtcService.aggregateQuery([
      {
        $match: {
          fromWarehouseId: new mongoose.Types.ObjectId(wid),
          secondApproved: true,
          isDeleted: false,
          ...datefilterQuery[0],
        },
      },
    ]);

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: {
        dealer: stockToDealer?.length,
        customer: stockToCustomer?.length,
        rtv: stockTortv?.length,
        warehouse: stockToWarehouse?.length,
        sample: stockToSample?.length,
        eCom: 0,
        company: stockToCompany?.length,
      },
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

// get warehouse dashboard inward stock data count

exports.getWhInwardStock = async (req, res) => {
  try {
    const { wid } = req.params;
    var dateFilter = req.body.dateFilter;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    //-----------------------------------
    let stockfromDealer = await dtwService.aggregateQuery([
      {
        $match: {
          toWarehouseId: new mongoose.Types.ObjectId(wid),
          // status: productStatus.notDispatched,
          isDeleted: false,
          ...datefilterQuery[0],
        },
      },
    ]);
    //-----------------------------------
    let stockFromCustomer = 0;

    //-----------------------------------
    let stockFromWarehouse = await wtwService.aggregateQuery([
      {
        $match: {
          toWarehouseId: new mongoose.Types.ObjectId(wid),
          secondApproved: true,
          isDeleted: false,
          ...datefilterQuery[0],
        },
      },
    ]);
    //-----------------------------------
    let stockFromSample = await wtsService.aggregateQuery([
      {
        $match: {
          fromWarehouseId: new mongoose.Types.ObjectId(wid),
          status: productStatus?.dispatched,
          isDeleted: false,
          ...datefilterQuery[0],
        },
      },
    ]);
    //-----------------------------------
    let stockFromCompany = await wtcService.aggregateQuery([
      {
        $match: {
          toWarehouseId: new mongoose.Types.ObjectId(wid),
          secondApproved: true,
          isDeleted: false,
          ...datefilterQuery[0],
        },
      },
    ]);

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: {
        dealer: stockfromDealer?.length,
        customer: stockFromCustomer,
        warehouse: stockFromWarehouse?.length,
        sample: stockFromSample?.length,
        eCom: 0,
        company: stockFromCompany?.length,
      },
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

// get all order status count for dealer
exports.getAllOrderStatusCountForDealer = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    //if no default query then pass {}
    let additionalQuery = [
      {
        $match: {
          ...datefilterQuery[0],
          assignDealerId: new mongoose.Types.ObjectId(req.userData.Id),
        },
      },
      {
        $facet: {
          freshOrders: [
            {
              $match: {
                status: orderStatusEnum.fresh,
              },
            },
            {
              $count: "count",
            },
          ],
          allOrders: [
            {
              $count: "count",
            },
          ],
          prepaidOrders: [
            {
              $match: {
                status: orderStatusEnum.prepaid,
              },
            },
            {
              $count: "count",
            },
          ],
          deliveredOrders: [
            {
              $match: {
                status: orderStatusEnum.delivered,
              },
            },
            {
              $count: "count",
            },
          ],
          doorCancelledOrders: [
            {
              $match: {
                status: orderStatusEnum.doorCancelled,
              },
            },
            {
              $count: "count",
            },
          ],
          holdOrders: [
            {
              $match: {
                status: orderStatusEnum.hold,
              },
            },
            {
              $count: "count",
            },
          ],
          pscOrders: [
            {
              $match: {
                status: orderStatusEnum.psc,
              },
            },
            {
              $count: "count",
            },
          ],
          unaOrders: [
            {
              $match: {
                status: orderStatusEnum.una,
              },
            },
            {
              $count: "count",
            },
          ],
          pndOrders: [
            {
              $match: {
                status: orderStatusEnum.pnd,
              },
            },
            {
              $count: "count",
            },
          ],
          urgentOrders: [
            {
              $match: {
                status: orderStatusEnum.urgent,
              },
            },
            {
              $count: "count",
            },
          ],
          nonActionOrders: [
            {
              $match: {
                status: orderStatusEnum.nonAction,
              },
            },
            {
              $count: "count",
            },
          ],
          rtoOrders: [
            {
              $match: {
                status: orderStatusEnum.rto,
              },
            },
            {
              $count: "count",
            },
          ],
          inquiryOrders: [
            {
              $match: {
                status: orderStatusEnum.inquiry,
              },
            },
            {
              $count: "count",
            },
          ],
          reattemptOrders: [
            {
              $match: {
                status: orderStatusEnum.reattempt,
              },
            },
            {
              $count: "count",
            },
          ],
          deliveryOutOfNetworkOrders: [
            {
              $match: {
                status: orderStatusEnum.deliveryOutOfNetwork,
              },
            },
            {
              $count: "count",
            },
          ],
          intransitOrders: [
            {
              $match: {
                status: orderStatusEnum.intransit,
              },
            },
            {
              $count: "count",
            },
          ],
          ndrOrders: [
            {
              $match: {
                status: orderStatusEnum.ndr,
              },
            },
            {
              $count: "count",
            },
          ],
        },
      },
      {
        $project: {
          freshOrders: {
            $ifNull: [{ $arrayElemAt: ["$freshOrders.count", 0] }, 0],
          },
          allOrders: {
            $ifNull: [{ $arrayElemAt: ["$allOrders.count", 0] }, 0],
          },
          prepaidOrders: {
            $ifNull: [{ $arrayElemAt: ["$prepaidOrders.count", 0] }, 0],
          },
          deliveredOrders: {
            $ifNull: [{ $arrayElemAt: ["$deliveredOrders.count", 0] }, 0],
          },
          doorCancelledOrders: {
            $ifNull: [{ $arrayElemAt: ["$doorCancelledOrders.count", 0] }, 0],
          },
          holdOrders: {
            $ifNull: [{ $arrayElemAt: ["$holdOrders.count", 0] }, 0],
          },
          pscOrders: {
            $ifNull: [{ $arrayElemAt: ["$pscOrders.count", 0] }, 0],
          },
          unaOrders: {
            $ifNull: [{ $arrayElemAt: ["$unaOrders.count", 0] }, 0],
          },
          pndOrders: {
            $ifNull: [{ $arrayElemAt: ["$pndOrders.count", 0] }, 0],
          },
          urgentOrders: {
            $ifNull: [{ $arrayElemAt: ["$urgentOrders.count", 0] }, 0],
          },
          nonActionOrders: {
            $ifNull: [{ $arrayElemAt: ["$nonActionOrders.count", 0] }, 0],
          },
          rtoOrders: {
            $ifNull: [{ $arrayElemAt: ["$rtoOrders.count", 0] }, 0],
          },
          inquiryOrders: {
            $ifNull: [{ $arrayElemAt: ["$inquiryOrders.count", 0] }, 0],
          },
          reattemptOrders: {
            $ifNull: [{ $arrayElemAt: ["$reattemptOrders.count", 0] }, 0],
          },
          deliveryOutOfNetworkOrders: {
            $ifNull: [
              { $arrayElemAt: ["$deliveryOutOfNetworkOrders.count", 0] },
              0,
            ],
          },
          intransitOrders: {
            $ifNull: [{ $arrayElemAt: ["$intransitOrders.count", 0] }, 0],
          },
          ndrOrders: {
            $ifNull: [{ $arrayElemAt: ["$ndrOrders.count", 0] }, 0],
          },
        },
      },
    ];

    let dataExist = await orderService.aggregateQuery(additionalQuery);
    console.log(dataExist, "dataExist");
    if (!dataExist || !dataExist?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist[0],
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

// get dealer pincode data (dashboard)
exports.getDealerPincodeDashboard = async (req, res) => {
  try {
    const dealerid = req.userData.Id;
    var dateFilter = req.body.dateFilter;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    let additionalQuery = [
      {
        $match: {
          isDeleted: false,
          companyId: new mongoose.Types.ObjectId(req.userData.companyId),
          dealerId: new mongoose.Types.ObjectId(dealerid),
          ...datefilterQuery[0],
        },
      },
      {
        $lookup: {
          from: "orderinquiries",
          localField: "dealerId",
          foreignField: "assignedDealerId",
          as: "orderInquiries",
        },
      },
      {
        $addFields: {
          quantity: { $sum: "$orderInquiries.quantity" },
          yetToShip: {
            $size: {
              $filter: {
                input: "$orderInquiries",
                as: "order",
                cond: { $eq: ["$$order.status", orderStatusEnum.fresh] },
              },
            },
          },
          shipped: {
            $size: {
              $filter: {
                input: "$orderInquiries",
                as: "order",
                cond: { $eq: ["$$order.status", orderStatusEnum.intransit] },
              },
            },
          },
          delivered: {
            $size: {
              $filter: {
                input: "$orderInquiries",
                as: "order",
                cond: { $eq: ["$$order.status", orderStatusEnum.delivered] },
              },
            },
          },
          canceled: {
            $size: {
              $filter: {
                input: "$orderInquiries",
                as: "order",
                cond: {
                  $eq: ["$$order.status", orderStatusEnum.doorCancelled],
                },
              },
            },
          },
        },
      },
    ];

    //-----------------------------------
    let dataFound = await dealerPincodeService.aggregateQuery(additionalQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: dataFound,
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

// get dealer product data (dashboard)
exports.getDealerProductDashboard = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    let additionalQuery = [
      {
        $match: {
          isDeleted: false,
          dealerId: new mongoose.Types.ObjectId(req.userData.Id),
          ...datefilterQuery[0],
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
        },
      },
      {
        $lookup: {
          from: "salesorders",
          localField: "productGroupId",
          foreignField: "productSalesOrder.productGroupId",
          as: "product_sale_order",
        },
      },
      {
        $lookup: {
          from: "orderinquiries",
          localField: "dealerId",
          foreignField: "assignDealerId",
          as: "shipping_pending_stock",
        },
      },
      {
        $addFields: {
          productGroupLabel: { $arrayElemAt: ["$product_group.groupName", 0] },
          productGroupPrice: {
            $arrayElemAt: ["$product_group.dealerSalePrice", 0],
          },
          defectiveStock: {
            $size: {
              $ifNull: ["$barcode", []], // Provide an empty array if $barcode is null
            },
          },
          stockReceivePending: {
            $cond: {
              if: { $isArray: "$product_sale_order" },
              then: { $sum: "$product_sale_order.productSalesOrder.quantity" },
              else: 0,
            },
          },
          shippingPendingStock: { $size: "$shipping_pending_stock" },
        },
      },
      {
        $unset: ["product_group", "warehouse_data"],
      },
      {
        $match: {
          isUsed: true,
          companyId: new mongoose.Types.ObjectId(req.userData.companyId),
        },
      },
      {
        $group: {
          _id: "$productGroupId",
          productGroupLabel: { $first: "$productGroupLabel" },
          productGroupPrice: { $first: "$productGroupPrice" },
          stockReceivePending: { $first: "$stockReceivePending" },
          shippingPendingStock: { $first: "$shippingPendingStock" },
          defectiveStock: { $first: "$defectiveStock" },
          count: { $sum: 1 },
          firstDocument: { $first: "$$ROOT" },
        },
      },
      {
        $project: {
          // _id: 0,
          // productGroupId: "$_id",

          productGroupLabel: 1,
          productGroupPrice: 1,
          stockReceivePending: 1,
          shippingPendingStock: 1,
          defectiveStock: 1,
        },
      },
    ];

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(additionalQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: dataFound,
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
