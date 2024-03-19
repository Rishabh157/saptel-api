const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const complainService = require("./ComplainService");
const complainLogsService = require("../complainLogs/ComplainLogsService");
const moneyBackService = require("../moneyBackRequest/MoneyBackRequestService");
const initialCallOneService = require("../initialCallOne/InitialCallOneService");
const moneyBackLogsService = require("../moneyBackRequestLog/MoneyBackRequestLogService");
const orderInquiryService = require("../orderInquiry/OrderInquiryService");
const { searchKeys } = require("./ComplainSchema");
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
const {
  complainStatusEnum,
  complainCallTypeEnum,
} = require("../../helper/enumUtils");
const { getComplaintNumber } = require("../call/CallHelper");
const {
  addMoneyBackRequest,
  addProductReplacementRequest,
} = require("./ComplaintHelper");

//add start
exports.add = async (req, res) => {
  try {
    let {
      orderNumber,
      orderId,
      schemeId,
      schemeName,
      schemeCode,
      orderStatus,
      courierStatus,
      callType,
      icOne,
      status,
      icTwo,
      icThree,
      remark,
      customerNumber,
    } = req.body;
    /**
     * check duplicate exist
     */

    let icOneData = await initialCallOneService.getOneByMultiField({
      isDeleted: false,
      isActive: true,
      _id: icOne,
    });
    if (!icOneData) {
      throw new ApiError(httpStatus.OK, "Invalid IC 1");
    }
    // if (status === complainStatusEnum.open) {
    let dataExist = await complainService.getOneByMultiField({
      callType: complainCallTypeEnum.complaint,
      status: complainStatusEnum.open,
      orderNumber,
      icOne: new mongoose.Types.ObjectId(icOne),
    });
    console.log(dataExist, "dataExist");
    if (dataExist) {
      throw new ApiError(
        httpStatus.OK,
        "Can not set another complain with same disposition"
      );
    }
    // }
    //------------------create data-------------------
    let complaintNumber = await getComplaintNumber();

    let dataCreated = await complainService.createNewData({
      complaintNumber,
      complaintById: req.userData.Id,
      companyId: req.userData.companyId,
      ...req.body,
    });

    if (dataCreated) {
      await complainLogsService.createNewData({
        complainId: dataCreated._id,
        complaintById: req.userData.Id,
        complaintNumber,
        companyId: req.userData.companyId,
        ...req.body,
      });
      let orderDetails = await orderInquiryService.getOneByMultiField({
        _id: orderId,
        isDeleted: false,
        isActive: true,
      });

      if (config.money_back_id === icOneData.initialCallName) {
        let moneyBackData = await addMoneyBackRequest(
          orderDetails,
          complaintNumber,
          req.userData
        );
      }
      if (
        config.product_replacement_disposition === icOneData.initialCallName
      ) {
        let productReplacementkData = await addProductReplacementRequest(
          orderDetails,
          complaintNumber,
          req.userData
        );
      }
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

//update start
exports.update = async (req, res) => {
  try {
    let {
      orderNumber,
      orderId,
      schemeId,
      schemeName,
      schemeCode,
      orderStatus,
      courierStatus,
      callType,
      icOne,
      icTwo,
      icThree,
      remark,
    } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await complainService.isExists([]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    let icOneData = await initialCallOneService.getOneByMultiField({
      isDeleted: false,
      isActive: true,
      _id: icOne,
    });
    if (!icOneData) {
      throw new ApiError(httpStatus.OK, "Invalid IC 1");
    }
    //------------------Find data-------------------
    let datafound = await complainService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Complain not found.`);
    }

    let dataUpdated = await complainService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          ...req.body,
          complaintById: req.userData.Id,
        },
      }
    );

    if (dataUpdated) {
      await complainLogsService.createNewData({
        complainId: dataUpdated._id,
        complaintById: req.userData.Id,
        complaintNumber: dataUpdated?.complaintNumber,
        ...req.body,
      });

      let orderDetails = await orderInquiryService.getOneByMultiField({
        _id: orderId,
        isDeleted: false,
        isActive: true,
      });

      if (config.money_back_id === icOneData.initialCallName) {
        let moneyBackData = await addMoneyBackRequest(
          orderDetails,
          dataUpdated.complaintNumber,
          req.userData
        );
      }
      if (
        config.product_replacement_disposition === icOneData.initialCallName
      ) {
        let productReplacementkData = await addProductReplacementRequest(
          orderDetails,
          dataUpdated.complaintNumber,
          req.userData
        );
      }
      return res.status(httpStatus.CREATED).send({
        message: "Updated successfully.",
        data: dataUpdated,
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
    let booleanFields = [];
    let numberFileds = ["complaintNumber", "orderNumber"];
    let objectIdFields = ["orderId", "schemeId", "icOne", "icTwo", "icThree"];
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
          from: "initialcallthrees",
          localField: "icThree",
          foreignField: "_id",
          as: "initialcallThreeData",
          pipeline: [
            {
              $project: {
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "initialcalltwos",
          localField: "icTwo",
          foreignField: "_id",
          as: "initialcallTwoData",
          pipeline: [
            {
              $project: {
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "initialcallones",
          localField: "icOne",
          foreignField: "_id",
          as: "initialcallOneData",
          pipeline: [
            {
              $project: {
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "complaintById",
          foreignField: "_id",
          as: "userData",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          initialCallThreeLabel: {
            $arrayElemAt: ["$initialcallThreeData.initialCallDisplayName", 0],
          },
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallDisplayName", 0],
          },
          initialCallOneLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallDisplayName", 0],
          },
          complaintbyLabel: {
            $concat: [
              { $arrayElemAt: ["$userData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$userData.lastName", 0] },
            ],
          },
        },
      },
      {
        $unset: [
          "initialcallTwoData",
          "initialcallOneData",
          "initialcallThreeData",
          "userData",
        ],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await complainService.aggregateQuery(finalAggregateQuery);
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

    let result = await complainService.aggregateQuery(finalAggregateQuery);
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
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "initialcallthrees",
          localField: "icThree",
          foreignField: "_id",
          as: "initialcallThreeData",
          pipeline: [
            {
              $project: {
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "initialcalltwos",
          localField: "icTwo",
          foreignField: "_id",
          as: "initialcallTwoData",
          pipeline: [
            {
              $project: {
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "initialcallones",
          localField: "icOne",
          foreignField: "_id",
          as: "initialcallOneData",
          pipeline: [
            {
              $project: {
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "complaintById",
          foreignField: "_id",
          as: "userData",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          initialCallThreeLabel: {
            $arrayElemAt: ["$initialcallThreeData.initialCallName", 0],
          },
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallName", 0],
          },
          initialCallOneLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallName", 0],
          },
          complaintbyLabel: {
            $concat: [
              { $arrayElemAt: ["$userData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$userData.lastName", 0] },
            ],
          },
        },
      },
      {
        $unset: [
          "initialcallTwoData",
          "initialcallOneData",
          "initialcallThreeData",
          "userData",
        ],
      },
    ];

    let dataExist = await complainService.aggregateQuery(additionalQuery);

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

//get by number
exports.getByNumber = async (req, res) => {
  try {
    //if no default query then pass {}
    const { number } = req.params;
    let matchQuery = { isDeleted: false, customerNumber: number };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      { $sort: { _id: -1 } },
      {
        $lookup: {
          from: "initialcallthrees",
          localField: "icThree",
          foreignField: "_id",
          as: "initialcallThreeData",
          pipeline: [
            {
              $project: {
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "initialcalltwos",
          localField: "icTwo",
          foreignField: "_id",
          as: "initialcallTwoData",
          pipeline: [
            {
              $project: {
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "initialcallones",
          localField: "icOne",
          foreignField: "_id",
          as: "initialcallOneData",
          pipeline: [
            {
              $project: {
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "complaintById",
          foreignField: "_id",
          as: "userData",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          initialCallThreeLabel: {
            $arrayElemAt: ["$initialcallThreeData.initialCallDisplayName", 0],
          },
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallDisplayName", 0],
          },
          initialCallOneLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallDisplayName", 0],
          },
          complaintbyLabel: {
            $concat: [
              { $arrayElemAt: ["$userData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$userData.lastName", 0] },
            ],
          },
        },
      },
      {
        $unset: [
          "initialcallTwoData",
          "initialcallOneData",
          "initialcallThreeData",
          "userData",
        ],
      },
    ];

    let dataExist = await complainService.aggregateQuery(additionalQuery);

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
        },
      },
      {
        $lookup: {
          from: "initialcallthrees",
          localField: "icThree",
          foreignField: "_id",
          as: "initialcallThreeData",
          pipeline: [
            {
              $project: {
                initialCallName: 1,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "initialcalltwos",
          localField: "icTwo",
          foreignField: "_id",
          as: "initialcallTwoData",
          pipeline: [
            {
              $project: {
                initialCallName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "initialcallones",
          localField: "icOne",
          foreignField: "_id",
          as: "initialcallOneData",
          pipeline: [
            {
              $project: {
                initialCallName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "complaintById",
          foreignField: "_id",
          as: "userData",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          initialCallThreeLabel: {
            $arrayElemAt: ["$initialcallThreeData.initialCallName", 0],
          },
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallName", 0],
          },
          initialCallOneLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallName", 0],
          },
          complaintbyLabel: {
            $concat: [
              { $arrayElemAt: ["$userData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$userData.lastName", 0] },
            ],
          },
        },
      },
      {
        $unset: [
          "initialcallTwoData",
          "initialcallOneData",
          "initialcallThreeData",
          "userData",
        ],
      },
    ];
    let dataExist = await complainService.aggregateQuery(additionalQuery);

    if (!dataExist) {
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

//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await complainService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await complainService.getOneAndDelete({ _id });
    if (!deleted) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: null,
      code: null,
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
//statusChange
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await complainService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await complainService.getOneAndUpdate(
      { _id },
      { isActive }
    );
    if (!statusChanged) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: statusChanged,
      code: null,
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
