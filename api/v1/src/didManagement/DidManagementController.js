const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const didManagementService = require("./DidManagementService");
const { searchKeys } = require("./DidManagementSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const schemeService = require("../scheme/SchemeService");
const companyService = require("../company/CompanyService");
const channelMasterService = require("../channelMaster/ChannelMasterService");
const {
  checkIdInCollectionsThenDelete,
  collectionArrToMatch,
} = require("../../helper/commonHelper");
const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const mongoose = require("mongoose");
const { moduleType, actionType } = require("../../helper/enumUtils");

//add start
exports.add = async (req, res) => {
  try {
    let { didNumber, schemeId, channelId, companyId } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await didManagementService.isExists([{ didNumber }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    const isSchemeIdExists = await schemeService.findCount({
      _id: schemeId,
      isDeleted: false,
    });

    const isChannelExists = await channelMasterService.findCount({
      _id: channelId,
      isDeleted: false,
    });

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isSchemeIdExists) {
      throw new ApiError(httpStatus.OK, "Invalid Scheme");
    }
    if (!isChannelExists) {
      throw new ApiError(httpStatus.OK, "Invalid channel");
    }

    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid company");
    }
    //------------------create data-------------------
    let dataCreated = await didManagementService.createNewData({ ...req.body });

    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: "Added successfully.",
        data: dataCreated,
        status: true,
        code: "CREATED",
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
    let { didNumber, schemeId, channelId, companyId } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await didManagementService.isExists(
      [{ didNumber }],
      idToBeSearch
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------Find data-------------------
    let datafound = await didManagementService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `DidManagement not found.`);
    }
    const isSchemeIdExists = await schemeService.findCount({
      _id: schemeId,
      isDeleted: false,
    });
    const isChannelExists = await channelMasterService.findCount({
      _id: channelId,
      isDeleted: false,
    });
    if (!isChannelExists) {
      throw new ApiError(httpStatus.OK, "Invalid channel");
    }

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isSchemeIdExists) {
      throw new ApiError(httpStatus.OK, "Invalid Scheme");
    }

    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid company");
    }

    let dataUpdated = await didManagementService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          ...req.body,
        },
      }
    );

    if (dataUpdated) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: dataUpdated,
        status: true,
        code: "OK",
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

// getByDidNo
exports.getByDidNo = async (req, res) => {
  try {
    let didNo = req.params.didno;

    let additionalQuery = [
      { $match: { didNumber: didNo } },
      {
        $lookup: {
          from: "schemes",
          localField: "schemeId",
          foreignField: "_id",
          as: "scheme_data",
          pipeline: [
            {
              $project: {
                schemeName: 1,
              },
            },
          ],
        },
      },
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
      {
        $addFields: {
          schemeLabel: {
            $arrayElemAt: ["$scheme_data.schemeName", 0],
          },
          channelLabel: {
            $arrayElemAt: ["$channel_data.channelName", 0],
          },
        },
      },
      {
        $unset: ["channel_data", "scheme_data"],
      },
    ];
    let dataExist = await didManagementService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist.length) {
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
    let objectIdFields = ["schemeId", "channelId", "companyId"];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFields
    );
    console.log(filterQuery);
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
          as: "scheme_data",
          pipeline: [
            {
              $project: {
                schemeName: 1,
                schemeCode: 1,
              },
            },
          ],
        },
      },
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
      {
        $addFields: {
          schemeLabel: {
            $arrayElemAt: ["$scheme_data.schemeName", 0],
          },
          schemeCode: {
            $arrayElemAt: ["$scheme_data.schemeCode", 0],
          },
          channelLabel: {
            $arrayElemAt: ["$channel_data.channelName", 0],
          },
        },
      },
      {
        $unset: ["channel_data", "scheme_data"],
      },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await didManagementService.aggregateQuery(
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
    let userRoleData = await getUserRoleData(req, didManagementService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.didManagement,
      userRoleData,
      actionType.pagination
    );
    let result = await didManagementService.aggregateQuery(finalAggregateQuery);
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
//get api
exports.get = async (req, res) => {
  try {
    let companyId = req.params.companyid;

    //if no default query then pass {}
    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "schemes",
          localField: "schemeId",
          foreignField: "_id",
          as: "scheme_data",
          pipeline: [
            {
              $project: {
                schemeName: 1,
                schemeCode: 1,
              },
            },
          ],
        },
      },
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
      {
        $addFields: {
          schemeLabel: {
            $arrayElemAt: ["$scheme_data.schemeName", 0],
          },
          schemeCode: {
            $arrayElemAt: ["$scheme_data.schemeCode", 0],
          },
          channelLabel: {
            $arrayElemAt: ["$channel_data.channelName", 0],
          },
        },
      },
      {
        $unset: ["channel_data", "scheme_data"],
      },
    ];

    let userRoleData = await getUserRoleData(req, didManagementService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.didManagement,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await didManagementService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields || !allowedFields?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: allowedFields,
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

// get by id
exports.getById = async (req, res) => {
  try {
    //if no default query then pass {}
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
          from: "schemes",
          localField: "schemeId",
          foreignField: "_id",
          as: "scheme_data",
          pipeline: [
            {
              $project: {
                schemeName: 1,
                schemeCode: 1,
              },
            },
          ],
        },
      },
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
      {
        $addFields: {
          schemeLabel: {
            $arrayElemAt: ["$scheme_data.schemeName", 0],
          },
          schemeCode: {
            $arrayElemAt: ["$scheme_data.schemeCode", 0],
          },
          channelLabel: {
            $arrayElemAt: ["$channel_data.channelName", 0],
          },
        },
      },
      {
        $unset: ["channel_data", "scheme_data"],
      },
    ];

    let userRoleData = await getUserRoleData(req, didManagementService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.didManagement,
      userRoleData,
      actionType.view
    );
    let dataExist = await didManagementService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: allowedFields[0],
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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await didManagementService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "didNumber",
      _id
    );

    if (deleteRefCheck.status === true) {
      let deleted = await didManagementService.getOneAndDelete({ _id });
      if (!deleted) {
        throw new ApiError(httpStatus.OK, "Some thing went wrong.");
      }
    }

    return res.status(httpStatus.OK).send({
      message: deleteRefCheck.message,
      status: deleteRefCheck.status,
      data: null,
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
//statusChange
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await didManagementService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await didManagementService.getOneAndUpdate(
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
