const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const slotMasterService = require("../../services/SlotMasterService");
const { searchKeys } = require("../../model/SlotMasterSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const channelGroupService = require("../../services/ChannelGroupService");
const tapeMasterService = require("../../services/TapeMasterService");
const channelMasterService = require("../../services/ChannelMasterService");
const companyService = require("../../services/CompanyService");

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
      slotName,
      channelGroup,
      startDateTime,
      type,
      days,
      tapeName,
      channelName,
      endDateTime,
      channelTrp,
      remarks,
      companyId,
    } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await slotMasterService.isExists([{ slotName }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    const isChannelGroupExists = await channelGroupService.findCount({
      _id: channelGroup,
      isDeleted: false,
    });
    const isTapeExists = await tapeMasterService.findCount({
      _id: tapeName,
      isDeleted: false,
    });
    const isChannelExists = await channelMasterService.findCount({
      _id: channelName,
      isDeleted: false,
    });
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    if (!isChannelGroupExists) {
      throw new ApiError(httpStatus.OK, "Invalid channel group");
    }
    if (!isTapeExists) {
      throw new ApiError(httpStatus.OK, "Invalid tape");
    }
    if (!isChannelExists) {
      throw new ApiError(httpStatus.OK, "Invalid channel");
    }

    //------------------create data-------------------
    let dataCreated = await slotMasterService.createNewData({ ...req.body });

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

//update start
exports.update = async (req, res) => {
  try {
    let {
      slotName,
      channelGroup,
      startDateTime,
      type,
      days,
      tapeName,
      channelName,
      endDateTime,
      channelTrp,
      remarks,
      companyId,
    } = req.body;

    let idToBeSearch = req.params.id;

    //------------------Find data-------------------
    let datafound = await slotMasterService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `SlotMaster not found.`);
    }
    const isChannelGroupExists = await channelGroupService.findCount({
      _id: channelGroup,
      isDeleted: false,
    });
    const isTapeExists = await tapeMasterService.findCount({
      _id: tapeName,
      isDeleted: false,
    });
    const isChannelExists = await channelMasterService.findCount({
      _id: channelName,
      isDeleted: false,
    });
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    if (!isChannelGroupExists) {
      throw new ApiError(httpStatus.OK, "Invalid language");
    }
    if (!isTapeExists) {
      throw new ApiError(httpStatus.OK, "Invalid tape");
    }
    if (!isChannelExists) {
      throw new ApiError(httpStatus.OK, "Invalid channel");
    }
    let dataUpdated = await slotMasterService.getOneAndUpdate(
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
    let numberFileds = [
      "slotName",
      "channelGroup",
      "startDateTime",
      "type",
      "days",
      "tapeName",
      "channelName",
      "endDateTime",
      "channelTrp",
      "remarks",
    ];

    const filterQuery = getFilterQuery(filterBy, booleanFields, numberFileds);
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
          from: "channelgroups",
          localField: "channelGroupId",
          foreignField: "_id",
          as: "channelGroup_data",
          pipeline: [
            {
              $project: {
                groupName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "tapemasters",
          localField: "tapeNameId",
          foreignField: "_id",
          as: "tape_data",
          pipeline: [
            {
              $project: {
                tapeName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "channelmasters",
          localField: "channelNameId",
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
          groupNameLabel: {
            $arrayElemAt: ["$channelGroup_data.groupName", 0],
          },
          tapeLabel: {
            $arrayElemAt: ["$tape_data.tapeName", 0],
          },
          channelLabel: {
            $arrayElemAt: ["$channel_data.channelName", 0],
          },
        },
      },
      {
        $unset: ["channel_data", "tape_data", "channelGroup_data"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await slotMasterService.aggregateQuery(finalAggregateQuery);
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

    let result = await slotMasterService.aggregateQuery(finalAggregateQuery);
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
          from: "channelgroups",
          localField: "channelGroupId",
          foreignField: "_id",
          as: "channelGroup_data",
          pipeline: [
            {
              $project: {
                groupName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "tapemasters",
          localField: "tapeNameId",
          foreignField: "_id",
          as: "tape_data",
          pipeline: [
            {
              $project: {
                tapeName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "channelmasters",
          localField: "channelNameId",
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
          groupNameLabel: {
            $arrayElemAt: ["$channelGroup_data.groupName", 0],
          },
          tapeLabel: {
            $arrayElemAt: ["$tape_data.tapeName", 0],
          },
          channelLabel: {
            $arrayElemAt: ["$channel_data.channelName", 0],
          },
        },
      },
      {
        $unset: ["channel_data", "tape_data", "channelGroup_data"],
      },
    ];

    let dataExist = await slotMasterService.aggregateQuery(additionalQuery);

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

//get api
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
          from: "channelgroups",
          localField: "channelGroupId",
          foreignField: "_id",
          as: "channelGroup_data",
          pipeline: [
            {
              $project: {
                groupName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "tapemasters",
          localField: "tapeNameId",
          foreignField: "_id",
          as: "tape_data",
          pipeline: [
            {
              $project: {
                tapeName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "channelmasters",
          localField: "channelNameId",
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
          groupNameLabel: {
            $arrayElemAt: ["$channelGroup_data.groupName", 0],
          },
          tapeLabel: {
            $arrayElemAt: ["$tape_data.tapeName", 0],
          },
          channelLabel: {
            $arrayElemAt: ["$channel_data.channelName", 0],
          },
        },
      },
      {
        $unset: ["channel_data", "tape_data", "channelGroup_data"],
      },
    ];

    let dataExist = await slotMasterService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist.length) {
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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await slotMasterService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await slotMasterService.getOneAndDelete({ _id });
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
    let dataExist = await slotMasterService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await slotMasterService.getOneAndUpdate(
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
