const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const houseArrestRequestService = require("./HouseArrestRequestService");
const orderInquiryService = require("../orderInquiry/OrderInquiryService");
const initialCallTwoService = require("../initialCallTwo/InitialCallTwoService");
const schemeService = require("../scheme/SchemeService");
const complaintService = require("../complain/ComplainService");
const complainLogsService = require("../complainLogs/ComplainLogsService");
const initialCallThreeService = require("../initialCallThree/InitialCallThreeService");
const initialCallOneService = require("../initialCallOne/InitialCallOneService");
const houseArrestLogsService = require("../houseArrestRequestLogs/HouseArrestRequestLogsService");
const { searchKeys } = require("./HouseArrestRequestSchema");
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
const { getComplaintNumber, getMBKNumber } = require("../call/CallHelper");
const {
  complainCallTypeEnum,
  complainStatusEnum,
} = require("../../helper/enumUtils");
const { default: mongoose } = require("mongoose");

//add start
exports.add = async (req, res) => {
  try {
    let { orderNumber, ic2, ic3, remark } = req.body;

    // valid IC 1
    const ic1Data = await initialCallOneService?.getOneByMultiField({
      initialCallName: config.houseArrestCaseDisposition,
      isDeleted: false,
      isActive: true,
    });
    if (!ic1Data) {
      throw new ApiError(httpStatus.OK, "Something went wrong, IC1 invalid");
    }
    let alreadyComplaint = await complaintService.getOneByMultiField({
      callType: complainCallTypeEnum.complaint,
      status: complainStatusEnum.open,
      orderNumber,
      icOne: new mongoose.Types.ObjectId(ic1Data?._id),
    });
    if (alreadyComplaint) {
      throw new ApiError(
        httpStatus.OK,
        "Can not set another complain with same disposition"
      );
    }
    /**
     * check duplicate exist
     */
    const orderData = await orderInquiryService?.getOneByMultiField({
      orderNumber: parseInt(orderNumber),
    });
    if (!orderData) {
      throw new ApiError(httpStatus.OK, "Invalid order number");
    }

    // valid IC 2
    const isIc2Exists = await initialCallTwoService?.getOneByMultiField({
      _id: ic2,
      isDeleted: false,
      isActive: true,
    });
    if (!isIc2Exists) {
      throw new ApiError(httpStatus.OK, "Invalid IC 2");
    }
    // valid IC 3
    const isIc3Exists = await initialCallThreeService?.getOneByMultiField({
      _id: ic3,
      isDeleted: false,
      isActive: true,
    });
    if (!isIc3Exists) {
      throw new ApiError(httpStatus.OK, "Invalid IC 3");
    }
    let complaintNumber = await getComplaintNumber();
    let mbkNumber = await getMBKNumber();

    // geeting scheme data
    let schemeData = await schemeService.getOneByMultiField({
      _id: orderData?.schemeId,
      isDeleted: false,
      isActive: true,
    });
    // creating a complaint
    let complaint = await complaintService.createNewData({
      complaintNumber: complaintNumber,
      orderNumber: orderData?.orderNumber,
      customerNumber: orderData?.mobileNo,
      orderId: orderData?._id,
      schemeId: orderData?.schemeId,
      schemeName: schemeData?.schemeName,
      schemeCode: schemeData?.schemeCode,
      orderStatus: orderData?.status,
      courierStatus: orderData?.status,
      callType: complainCallTypeEnum.complaint,
      icOne: ic1Data?._id,
      icTwo: ic2,
      icThree: ic3,
      icOneLabel: ic1Data?.initialCallName,
      icTwoLabel: isIc2Exists?.initialCallName,
      icThreeLabel: isIc3Exists?.initialCallName,
      complaintById: req?.userData?.Id,
      status: complainStatusEnum.open,
      companyId: req?.userData?.companyId,
      remark,
    });
    if (complaint) {
      await complainLogsService.createNewData({
        complainId: complaint._id,
        complaintNumber,
        orderNumber: orderData?.orderNumber,
        customerNumber: orderData?.mobileNo,
        orderId: orderData?._id,
        schemeId: orderData?.schemeId,
        schemeName: schemeData?.schemeName,
        schemeCode: schemeData?.schemeCode,
        orderStatus: orderData?.status,
        courierStatus: orderData?.status,
        callType: complainCallTypeEnum.complaint,
        icOne: ic1Data?._id,
        icTwo: ic2,
        icThree: ic3,
        icOneLabel: ic1Data?.initialCallName,
        icTwoLabel: isIc2Exists?.initialCallName,
        icThreeLabel: isIc3Exists?.initialCallName,
        complaintById: req?.userData?.Id,
        status: complainStatusEnum.open,
        companyId: req?.userData?.companyId,
        remark,
      });
    }

    // updating order with mbk number
    await orderInquiryService?.getOneAndUpdate(
      { orderNumber: parseInt(orderNumber), isActive: true, isDeleted: false },
      {
        $set: {
          orderMBKNumber: mbkNumber,
        },
      }
    );

    console.log(orderData, "orderData");

    //------------------create data-------------------
    let dataCreated = await houseArrestRequestService.createNewData({
      orderNumber,
      mbkNumber: mbkNumber,
      complaintNumber: complaint?.complaintNumber, // to be here ,
      requestCreatedBy: req.userData.Id,
      requestCreatedByRemark: remark,
      schemeId: orderData.schemeId,
      dealerId: orderData.assignDealerId,
      customerName: orderData.customerName,
      address: orderData?.autoFillingShippingAddress,
      stateId: orderData?.stateId,
      pincodeId: orderData?.pincodeId,
      tehsilId: orderData?.tehsilId,
      districtId: orderData?.districtId,
      areaId: orderData?.areaId,
      customerNumber: orderData?.mobileNo,
      alternateNumber: orderData?.alternateNo,
      companyId: req?.userData?.companyId,
    });

    await houseArrestLogsService.createNewData({
      orderNumber,
      complaintNumber: dataCreated?.complaintNumber,
      requestCreatedBy: dataCreated?.requestCreatedBy,
      mbkNumber: dataCreated?.mbkNumber,
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

// all filter pagination api
exports.allFilterPagination = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.params;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };
    /**
     * to send only active data on web
     */
    if (req.path.includes("/app/") || req.path.includes("/app")) {
      matchQuery.$and.push({ isActive: true });
    }

    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue
    );

    //----------------------------

    /**
     * check search keys valid
     **/

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
    const rangeQuery = getRangeQuery(rangeFilterBy);
    if (rangeQuery && rangeQuery.length) {
      matchQuery.$and.push(...rangeQuery);
    }

    //----------------------------
    /**
     * get filter query
     */
    let booleanFields = [
      "ccApproval",
      "managerFirstApproval",
      "dealerApproval",
      "managerSecondApproval",
      "accountApproval",
    ];
    let numberFileds = [];
    let objectIdFields = [
      "requestCreatedBy",
      "schemeId",
      "stateId",
      "districtId",
      "tehsilId",
      "pincodeId",
      "areaId",
    ];
    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFields
    );
    if (filterQuery && filterQuery.length) {
      matchQuery.$and.push(...filterQuery);
    }
    //----------------------------
    //calander filter
    /**
     * ToDo : for date filter
     */

    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
      {
        $lookup: {
          from: "users",
          localField: "requestCreatedBy",
          foreignField: "_id",
          as: "requestCrBy",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },

      {
        $addFields: {
          requestCreatedByLabel: {
            $concat: [
              { $arrayElemAt: ["$requestCrBy.firstName", 0] },
              " ",
              { $arrayElemAt: ["$requestCrBy.lastName", 0] },
            ],
          },
        },
      },

      {
        $unset: ["requestCrBy"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await houseArrestRequestService.aggregateQuery(
      finalAggregateQuery
    );
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        dataFound.length,
        req.body.isPaginationRequired
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }

    let result = await houseArrestRequestService.aggregateQuery(
      finalAggregateQuery
    );
    if (result.length) {
      return res.status(200).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
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
//get api
exports.get = async (req, res) => {
  try {
    //if no default query then pass {}
    let matchQuery = { isDeleted: false };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let dataExist = await houseArrestRequestService.findAllWithQuery(
      matchQuery
    );

    if (!dataExist || !dataExist.length) {
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

//get by id
exports.getById = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;
    let additionalQuery = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(idToBeSearch),
          isDeleted: false,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "stateId",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "districtId",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "pincodeId",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $lookup: {
          from: "tehsils",
          localField: "tehsilId",
          foreignField: "_id",
          as: "tehsil_name",
          pipeline: [{ $project: { tehsilName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "stateId",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "pincodeId",
          foreignField: "_id",
          as: "pincodeData",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $lookup: {
          from: "schemes",
          localField: "schemeId",
          foreignField: "_id",
          as: "schemeData",
          pipeline: [
            { $project: { schemeName: 1, schemeCode: 1, schemePrice: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "dealerId",
          foreignField: "_id",
          as: "dealerData",
          pipeline: [
            {
              $project: {
                lastName: 1,
                firstName: 1,
                dealerCode: 1,
                firmName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          stateLable: {
            $arrayElemAt: ["$state_name.stateName", 0],
          },
          districtLable: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },

          tehsilLable: {
            $arrayElemAt: ["$tehsil_name.tehsilName", 0],
          },
          pincodeLabel: {
            $arrayElemAt: ["$pincodeData.pincode", 0],
          },
          schemeLabel: {
            $arrayElemAt: ["$schemeData.schemeName", 0],
          },
          schemeCode: {
            $arrayElemAt: ["$schemeData.schemeCode", 0],
          },
          schemePrice: {
            $arrayElemAt: ["$schemeData.schemePrice", 0],
          },

          dealerLabel: {
            $concat: [
              { $arrayElemAt: ["$dealerData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$dealerData.lastName", 0] },
            ],
          },
          dealerCode: {
            $arrayElemAt: ["$dealerData.dealerCode", 0],
          },
          dealerFirmName: {
            $arrayElemAt: ["$dealerData.firmName", 0],
          },
        },
      },
      {
        $unset: [
          "state_name",
          "district_name",
          "pincode_name",
          "tehsil_name",
          "pincodeData",
          "schemeData",
          "dealerData",
        ],
      },
    ];
    let dataExist = await houseArrestRequestService.aggregateQuery(
      additionalQuery
    );

    if (!dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist[0],
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
