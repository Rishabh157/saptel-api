const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const moneyBackRequestService = require("./MoneyBackRequestService");
const moneyBackRequestLogService = require("../moneyBackRequestLog/MoneyBackRequestLogService");
const complaintService = require("../complain/ComplainService");
const { searchKeys } = require("./MoneyBackRequestSchema");
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
const { complainStatusEnum } = require("../../helper/enumUtils");

//add start
exports.add = async (req, res) => {
  try {
    let {
      orderNumber,
      complaintNumber,
      schemeId,
      dealerId,
      dateOfDelivery,
      requestResolveDate,
      settledAmount,
      amountInWords,
      customerName,
      address,
      stateId,
      districtId,
      tehsilId,
      pincode,
      customerNumber,
      alternateNumber,
      bankName,
      accountNumber,
      ifscCode,
      ccRemark,
      ccApproval,
      accountRemark,
      accountApproval,
      managerFirstRemark,
      managerFirstApproval,
      managerSecondRemark,
      managerSecondApproval,
    } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await moneyBackRequestService.isExists([
      { orderNumber },
      { complaintNumber },
    ]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------
    let dataCreated = await moneyBackRequestService.createNewData({
      ...req.body,
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
      $and: [
        {
          isDeleted: false,
          companyId: new mongoose.Types.ObjectId(req?.userData?.companyId),
        },
      ],
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
      "accountApproval",
      "managerFirstApproval",
      "managerSecondApproval",
    ];
    let numberFileds = [];
    let objectIdFields = [
      "schemeId",
      "dealerId",
      "stateId",
      "districtId",
      "tehsilId",
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
          from: "users",
          localField: "requestCreatedById",
          foreignField: "_id",
          as: "requestCrBy",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },

      {
        $addFields: {
          schemeLabel: {
            $arrayElemAt: ["$schemeData.schemeName", 0],
          },
          schemeCode: {
            $arrayElemAt: ["$schemeData.schemeCode", 0],
          },
          schemePrice: {
            $arrayElemAt: ["$schemeData.schemePrice", 0],
          },
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
        $unset: ["schemeData", "requestCrBy"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await moneyBackRequestService.aggregateQuery(
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

    let result = await moneyBackRequestService.aggregateQuery(
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

    let dataExist = await moneyBackRequestService.findAllWithQuery(matchQuery);

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
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouseData",
          pipeline: [{ $project: { wareHouseCode: 1, wareHouseName: 1 } }],
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
          wareHouseLabel: {
            $arrayElemAt: ["$warehouseData.wareHouseName", 0],
          },
          wareHouseCode: {
            $arrayElemAt: ["$warehouseData.wareHouseCode", 0],
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
          "warehouseData",
        ],
      },
    ];
    let dataExist = await moneyBackRequestService.aggregateQuery(
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

// update manager approval
exports.updateManager = async (req, res) => {
  try {
    let { id, level, approve, remark, complaintNumber } = req.body;

    let dataExist = await moneyBackRequestService.findCount({
      _id: id,
      isDeleted: false,
      isActive: true,
    });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    if (level === "FIRST") {
      let firstUpdatedData = await moneyBackRequestService.getOneAndUpdate(
        { _id: id },
        {
          $set: {
            managerFirstApproval: approve,
            managerFirstRemark: remark,
            managerFirstApprovalDate: new Date(),
            managerFirstUserId: req?.userData.Id,
          },
        }
      );
      if (!firstUpdatedData) {
        throw new ApiError(httpStatus.OK, "Something went wrong!");
      } else {
        if (approve === false) {
          await complaintService?.getOneAndUpdate(
            { complaintNumber: complaintNumber },
            {
              $set: {
                status: complainStatusEnum.closed,
                remark: remark,
              },
            }
          );
        }
        await moneyBackRequestLogService.createNewData({
          moneyBackRequestId: firstUpdatedData?._id,
          complaintNumber: firstUpdatedData?.complaintNumber,
          managerFirstRemark: remark,
          managerFirstApprovalDate: firstUpdatedData?.managerFirstApprovalDate,
          companyId: req.userData.companyId,
          managerFirstUserId: firstUpdatedData?.managerFirstUserId,
        });
        return res.status(httpStatus.OK).send({
          message: "Successfull.",
          status: true,
          data: firstUpdatedData,
          code: null,
          issue: null,
        });
      }
    } else {
      let secondUpdatedData = await moneyBackRequestService.getOneAndUpdate(
        { _id: id },
        {
          $set: {
            managerSecondApproval: approve,
            managerSecondRemark: remark,
            managerSecondApprovalDate: new Date(),
            managerSecondUserId: req?.userData.Id,
          },
        }
      );
      if (!secondUpdatedData) {
        throw new ApiError(httpStatus.OK, "Something went wrong!");
      } else {
        if (approve === false) {
          await complaintService?.getOneAndUpdate(
            { complaintNumber: complaintNumber },
            {
              $set: {
                status: complainStatusEnum.closed,
                remark: remark,
              },
            }
          );
        }
        await moneyBackRequestLogService.createNewData({
          moneyBackRequestId: secondUpdatedData?._id,
          complaintNumber: secondUpdatedData?.complaintNumber,
          managerSecondRemark: remark,
          managerSecondApprovalDate:
            secondUpdatedData?.managerSecondApprovalDate,
          companyId: req.userData.companyId,
          managerSecondUserId: secondUpdatedData?.managerSecondUserId,
        });
        return res.status(httpStatus.OK).send({
          message: "Successfull.",
          status: true,
          data: secondUpdatedData,
          code: null,
          issue: null,
        });
      }
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

// update cc information
exports.ccUpdateDetails = async (req, res) => {
  try {
    let {
      id,
      customerNumber,
      alternateNumber,
      bankName,
      accountNumber,
      ifscCode,
      ccRemark,
    } = req.body;

    let dataExist = await moneyBackRequestService.findCount({
      _id: id,
      isDeleted: false,
      isActive: true,
    });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let updatedData = await moneyBackRequestService.getOneAndUpdate(
      { _id: id },
      {
        $set: {
          customerNumber,
          alternateNumber,
          bankName,
          accountNumber,
          ifscCode,
          ccRemark,
          ccApproval: true,
          ccApprovalDate: new Date(),
          ccInfoAddById: req?.userData?.Id,
        },
      }
    );
    if (!updatedData) {
      throw new ApiError(httpStatus.OK, "Something went wrong!");
    } else {
      await moneyBackRequestLogService.createNewData({
        moneyBackRequestId: updatedData?._id,
        complaintNumber: updatedData?.complaintNumber,
        ccRemark: ccRemark,
        ccApprovalDate: updatedData?.ccApprovalDate,
        companyId: req.userData.companyId,
        ccInfoAddById: req?.userData?.Id,
      });
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: updatedData,
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

//account approval
exports.accountApproval = async (req, res) => {
  try {
    let {
      id,
      accountRemark,
      accountApproval,
      settledAmount,
      amountInWords,
      complaintNumber,
    } = req.body;

    let dataExist = await moneyBackRequestService.findCount({
      _id: id,
      isDeleted: false,
      isActive: true,
    });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let updatedData = await moneyBackRequestService.getOneAndUpdate(
      { _id: id },
      {
        $set: {
          accountRemark,
          accountApproval,
          settledAmount,
          amountInWords,
          requestResolveDate: new Date(),
          accountApprovalDate: new Date(),
          accoutUserId: req?.userData?.Id,
        },
      }
    );
    if (!updatedData) {
      throw new ApiError(httpStatus.OK, "Something went wrong!");
    } else {
      if (accountApproval === false) {
        await complaintService?.getOneAndUpdate(
          { complaintNumber: complaintNumber },
          {
            $set: {
              status: complainStatusEnum.closed,
              remark: accountRemark,
            },
          }
        );
      }

      await moneyBackRequestLogService.createNewData({
        moneyBackRequestId: updatedData?._id,
        complaintNumber: updatedData?.complaintNumber,
        accountRemark: accountRemark,
        accountApprovalDate: updatedData?.accountApprovalDate,
        companyId: req.userData.companyId,
        accoutUserId: req?.userData?.Id,
      });
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: updatedData,
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
