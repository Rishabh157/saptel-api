const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const ndrLogsService = require("./NdrLogsService");
const { searchKeys } = require("./NdrLogsSchema");
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

//add start
exports.add = async (req, res) => {
  try {
    let {
      ndrId,
      orderNumber,
      addressLine1,
      addressLine2,
      pincode,
      district,
      state,
      callDisposition,
      rtoReattemptReason,
      validCourierRemark,
      reAttemptDate,
    } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await ndrLogsService.isExists([]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------
    let dataCreated = await ndrLogsService.createNewData({ ...req.body });

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
      "ndrId",
      "pincode",
      "district",
      "state",
      "callDisposition",
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
          from: "states",
          localField: "stateId",
          foreignField: "_id",
          as: "stateData",
          pipeline: [
            {
              $project: {
                stateName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "districtId",
          foreignField: "_id",
          as: "districtData",
          pipeline: [
            {
              $project: {
                districtName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "pincodeId",
          foreignField: "_id",
          as: "pincodeData",
          pipeline: [
            {
              $project: {
                pincode: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "ndrdispositions",
          localField: "callDisposition",
          foreignField: "_id",
          as: "ndrData",
          pipeline: [
            {
              $project: {
                ndrDisposition: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "ndrCreatedById",
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
          stateLabel: {
            $arrayElemAt: ["$stateData.stateName", 0],
          },
          districtLabel: {
            $arrayElemAt: ["$districtData.districtName", 0],
          },
          pincodeLabel: {
            $arrayElemAt: ["$pincodeData.pincode", 0],
          },
          callDispositionLabel: {
            $arrayElemAt: ["$ndrData.ndrDisposition", 0],
          },
          ndrCreatedByLabel: {
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
          "stateData",
          "districtData",
          "pincodeData",
          "ndrData",
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
    let dataFound = await ndrLogsService.aggregateQuery(finalAggregateQuery);
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

    let result = await ndrLogsService.aggregateQuery(finalAggregateQuery);
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
          from: "states",
          localField: "stateId",
          foreignField: "_id",
          as: "stateData",
          pipeline: [
            {
              $project: {
                stateName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "districtId",
          foreignField: "_id",
          as: "districtData",
          pipeline: [
            {
              $project: {
                districtName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "pincodeId",
          foreignField: "_id",
          as: "pincodeData",
          pipeline: [
            {
              $project: {
                pincode: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "ndrdispositions",
          localField: "callDisposition",
          foreignField: "_id",
          as: "ndrData",
          pipeline: [
            {
              $project: {
                ndrDisposition: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "ndrCreatedById",
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
          stateLabel: {
            $arrayElemAt: ["$stateData.stateName", 0],
          },
          districtLabel: {
            $arrayElemAt: ["$districtData.districtName", 0],
          },
          pincodeLabel: {
            $arrayElemAt: ["$pincodeData.pincode", 0],
          },
          callDispositionLabel: {
            $arrayElemAt: ["$ndrData.ndrDisposition", 0],
          },
          ndrCreatedByLabel: {
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
          "stateData",
          "districtData",
          "pincodeData",
          "ndrData",
          "userData",
        ],
      },
    ];

    let dataExist = await ndrLogsService.aggregateQuery(additionalQuery);

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
        _id: new mongoose.Types.ObjectId(idToBeSearch),
        isDeleted: false,
      },
      {
        $lookup: {
          from: "states",
          localField: "stateId",
          foreignField: "_id",
          as: "stateData",
          pipeline: [
            {
              $project: {
                stateName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "districtId",
          foreignField: "_id",
          as: "districtData",
          pipeline: [
            {
              $project: {
                districtName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "pincodeId",
          foreignField: "_id",
          as: "pincodeData",
          pipeline: [
            {
              $project: {
                pincode: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "ndrdispositions",
          localField: "callDisposition",
          foreignField: "_id",
          as: "ndrData",
          pipeline: [
            {
              $project: {
                ndrDisposition: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "ndrCreatedById",
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
          stateLabel: {
            $arrayElemAt: ["$stateData.stateName", 0],
          },
          districtLabel: {
            $arrayElemAt: ["$districtData.districtName", 0],
          },
          pincodeLabel: {
            $arrayElemAt: ["$pincodeData.pincode", 0],
          },
          callDispositionLabel: {
            $arrayElemAt: ["$ndrData.ndrDisposition", 0],
          },
          ndrCreatedByLabel: {
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
          "stateData",
          "districtData",
          "pincodeData",
          "ndrData",
          "userData",
        ],
      },
    ];
    let dataExist = await ndrLogsService.aggregateQuery(additionalQuery);

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
