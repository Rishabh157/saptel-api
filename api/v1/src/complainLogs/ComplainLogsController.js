const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const complainLogsService = require("./ComplainLogsService");
const { searchKeys } = require("./ComplainLogsSchema");
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

//add start
exports.add = async (req, res) => {
  try {
    let {
      complainId,
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
    /**
     * check duplicate exist
     */
    let dataExist = await complainLogsService.isExists([]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------
    let dataCreated = await complainLogsService.createNewData({ ...req.body });

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
    let booleanFields = [];
    let numberFileds = [];
    let objectIdFields = [
      "complainId",
      "orderId",
      "schemeId",
      "icOne",
      "icTwo",
      "icThree",
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
        $addFields: {
          complaintbyLabel: {
            $concat: [
              { $arrayElemAt: ["$userData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$userData.lastName", 0] },
            ],
          },
          initialCallThreeLabel: {
            $arrayElemAt: ["$initialcallThreeData.initialCallDisplayName", 0],
          },
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallDisplayName", 0],
          },
          initialCallOneLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallDisplayName", 0],
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
    let dataFound = await complainLogsService.aggregateQuery(
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

    let result = await complainLogsService.aggregateQuery(finalAggregateQuery);
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
      {
        $match: matchQuery,
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
        $addFields: {
          complaintbyLabel: {
            $concat: [
              { $arrayElemAt: ["$userData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$userData.lastName", 0] },
            ],
          },
          initialCallThreeLabel: {
            $arrayElemAt: ["$initialcallThreeData.initialCallDisplayName", 0],
          },
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallDisplayName", 0],
          },
          initialCallOneLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallDisplayName", 0],
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

    let dataExist = await complainLogsService.aggregateQuery(additionalQuery);

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

// get logs of a complaints
exports.getLogs = async (req, res) => {
  try {
    //if no default query then pass {}
    let complaintId = req.params.complaintId;
    console.log(complaintId, "complaintId");
    let matchQuery = {
      isDeleted: false,
      complainId: new mongoose.Types.ObjectId(complaintId),
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      {
        $match: matchQuery,
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
        $addFields: {
          complaintbyLabel: {
            $concat: [
              { $arrayElemAt: ["$userData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$userData.lastName", 0] },
            ],
          },
          initialCallThreeLabel: {
            $arrayElemAt: ["$initialcallThreeData.initialCallDisplayName", 0],
          },
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallDisplayName", 0],
          },
          initialCallOneLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallDisplayName", 0],
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

    let dataExist = await complainLogsService.aggregateQuery(additionalQuery);

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
        $addFields: {
          complaintbyLabel: {
            $concat: [
              { $arrayElemAt: ["$userData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$userData.lastName", 0] },
            ],
          },
          initialCallThreeLabel: {
            $arrayElemAt: ["$initialcallThreeData.initialCallDisplayName", 0],
          },
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallDisplayName", 0],
          },
          initialCallOneLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallDisplayName", 0],
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
    let dataExist = await complainLogsService.aggregateQuery(additionalQuery);

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
