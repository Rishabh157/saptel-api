const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const channelMasterService = require("./ChannelMasterService");
const { searchKeys } = require("./ChannelMasterSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const districtService = require("../district/DistrictService");
const channelGroupService = require("../channelGroup/ChannelGroupService");
const stateService = require("../state/StateService");
const countryService = require("../country/CountryService");
const channelCategoryService = require("../channelCategory/ChannelCategoryService");
const languageService = require("../language/LanguageService");
const companyService = require("../company/CompanyService");
const slotMasterService = require("../slotMaster/SlotMasterService");
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
const { default: mongoose } = require("mongoose");
const { moduleType, actionType } = require("../../helper/enumUtils");

//add start
exports.add = async (req, res) => {
  try {
    let {
      channelName,
      address,
      phone,
      email,
      districtId,
      channelGroupId,
      countryId,
      languageId,
      channelCategoryId,
      stateId,
      companyId,
      contactPerson,
      mobile,
      designation,
      website,
      paymentType,
    } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await channelMasterService.isExists([{ channelName }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    const isDistrictExists = await districtService.findCount({
      _id: districtId,
      isDeleted: false,
    });
    const isChannelGroupExists = await channelGroupService.findCount({
      _id: channelGroupId,
      isDeleted: false,
    });
    const isStateExists = await stateService.findCount({
      _id: stateId,
      isDeleted: false,
    });
    const isCountryExists = await countryService.findCount({
      _id: countryId,
      isDeleted: false,
    });
    const isChannelCategoryExists = await channelCategoryService.findCount({
      _id: channelCategoryId,
      isDeleted: false,
    });
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    const isLanguageExists = languageService?.length
      ? await languageService.findCount({
          _id: language,
          isDeleted: false,
        })
      : null;
    if (!isDistrictExists) {
      throw new ApiError(httpStatus.OK, "Invalid District");
    }
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    if (!isChannelGroupExists) {
      throw new ApiError(httpStatus.OK, "Invalid ChannelGroup");
    }
    if (!isStateExists) {
      throw new ApiError(httpStatus.OK, "Invalid State");
    }
    if (!isCountryExists) {
      throw new ApiError(httpStatus.OK, "Invalid Country");
    }
    if (!isChannelCategoryExists) {
      throw new ApiError(httpStatus.OK, "Invalid ChannelCategory");
    }
    if (languageService?.length && !isLanguageExists) {
      throw new ApiError(httpStatus.OK, "Invalid Language");
    }
    //------------------create data-------------------
    req.body.maskedPhoneNo = "******" + req.body.phone.substring(6);
    let dataCreated = await channelMasterService.createNewData({ ...req.body });

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
    let {
      channelName,
      address,
      phone,
      email,
      districtId,
      channelGroupId,
      countryId,
      languageId,
      channelCategoryId,
      stateId,
      companyId,
      contactPerson,
      mobile,
      designation,
      website,
      paymentType,
    } = req.body;

    let idToBeSearch = req.params.id;

    //------------------Find data-------------------
    let datafound = await channelMasterService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `ChannelMaster not found.`);
    }
    const isDistrictExists = await districtService.findCount({
      _id: districtId,
      isDeleted: false,
    });
    const isChannelGroupExists = await channelGroupService.findCount({
      _id: channelGroupId,
      isDeleted: false,
    });
    const isStateExists = await stateService.findCount({
      _id: stateId,
      isDeleted: false,
    });
    const isCountryExists = await countryService.findCount({
      _id: countryId,
      isDeleted: false,
    });
    const isChannelCategoryExists = await channelCategoryService.findCount({
      _id: channelCategoryId,
      isDeleted: false,
    });
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    const isLanguageExists = languageService?.length
      ? await languageService.findCount({
          _id: language,
          isDeleted: false,
        })
      : null;

    if (!isDistrictExists) {
      throw new ApiError(httpStatus.OK, "Invalid District");
    }
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    if (!isChannelGroupExists) {
      throw new ApiError(httpStatus.OK, "Invalid ChannelGroup");
    }
    if (!isStateExists) {
      throw new ApiError(httpStatus.OK, "Invalid State");
    }
    if (!isCountryExists) {
      throw new ApiError(httpStatus.OK, "Invalid Country");
    }
    if (!isChannelCategoryExists) {
      throw new ApiError(httpStatus.OK, "Invalid ChannelCategory");
    }
    if (languageService?.length && !isLanguageExists) {
      throw new ApiError(httpStatus.OK, "Invalid Language");
    }
    req.body.maskedPhoneNo = "******" + req.body.phone.substring(6);
    let dataUpdated = await channelMasterService.getOneAndUpdate(
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
      "districtId",
      "channelGroupId",
      "countryId",
      "languageId",
      "stateId",
      "channelCategoryId",
      "companyId",
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
          from: "districts",
          localField: "district",
          foreignField: "_id",
          as: "district_data",
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
          from: "channelgroups",
          localField: "channelGroupId",
          foreignField: "_id",
          as: "channel_group",
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
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "country_data",
          pipeline: [
            {
              $project: {
                countryName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "channelcategories",
          localField: "channelCategory",
          foreignField: "_id",
          as: "channel_category_data",
          pipeline: [
            {
              $project: {
                channelCategory: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "state",
          foreignField: "_id",
          as: "state_data",
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
          from: "languages",
          localField: "language",
          foreignField: "_id",
          as: "language_data",
          pipeline: [
            {
              $project: {
                languageName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          districtLabel: {
            $arrayElemAt: ["$district_data.districtName", 0],
          },
          channelGroupLabel: {
            $arrayElemAt: ["$channel_group.groupName", 0],
          },
          countryLabel: {
            $arrayElemAt: ["$country_data.countryName", 0],
          },
          channelCategoryLabel: {
            $arrayElemAt: ["$channel_category_data.channelCategory", 0],
          },

          stateLabel: {
            $arrayElemAt: ["$state_data.stateName", 0],
          },
          languageLabel: {
            $arrayElemAt: ["$language_data.languageName", 0],
          },
        },
      },
      {
        $unset: [
          "channel_category_data",
          "district_data",
          "channel_group",
          "country_data",
          "state_data",
          "language_data",
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
    let dataFound = await channelMasterService.aggregateQuery(
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
    let userRoleData = await getUserRoleData(req, channelMasterService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.channelManagement,
      userRoleData,
      actionType.pagination
    );
    let result = await channelMasterService.aggregateQuery(finalAggregateQuery);
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
          from: "districts",
          localField: "district",
          foreignField: "_id",
          as: "district_data",
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
          from: "channelgroups",
          localField: "channelGroupId",
          foreignField: "_id",
          as: "channel_group",
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
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "country_data",
          pipeline: [
            {
              $project: {
                countryName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "channelcategories",
          localField: "channelCategory",
          foreignField: "_id",
          as: "channel_category_data",
          pipeline: [
            {
              $project: {
                channelCategory: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "state",
          foreignField: "_id",
          as: "state_data",
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
          from: "languages",
          localField: "language",
          foreignField: "_id",
          as: "language_data",
          pipeline: [
            {
              $project: {
                languageName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          districtLabel: {
            $arrayElemAt: ["$district_data.districtName", 0],
          },
          channelGroupLabel: {
            $arrayElemAt: ["$channel_group.groupName", 0],
          },
          countryLabel: {
            $arrayElemAt: ["$country_data.countryName", 0],
          },
          channelCategoryLabel: {
            $arrayElemAt: ["$channel_category_data.channelCategory", 0],
          },

          stateLabel: {
            $arrayElemAt: ["$state_data.stateName", 0],
          },
          languageLabel: {
            $arrayElemAt: ["$language_data.languageName", 0],
          },
        },
      },
      {
        $unset: [
          "channel_category_data",
          "district_data",
          "channel_group",
          "country_data",
          "state_data",
          "language_data",
        ],
      },
    ];

    let userRoleData = await getUserRoleData(req, channelMasterService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.channelManagement,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await channelMasterService.aggregateQuery(additionalQuery);
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
          from: "districts",
          localField: "district",
          foreignField: "_id",
          as: "district_data",
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
          from: "channelgroups",
          localField: "channelGroupId",
          foreignField: "_id",
          as: "channel_group",
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
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "country_data",
          pipeline: [
            {
              $project: {
                countryName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "channelcategories",
          localField: "channelCategory",
          foreignField: "_id",
          as: "channel_category_data",
          pipeline: [
            {
              $project: {
                channelCategory: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "state",
          foreignField: "_id",
          as: "state_data",
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
          from: "languages",
          localField: "language",
          foreignField: "_id",
          as: "language_data",
          pipeline: [
            {
              $project: {
                languageName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          districtLabel: {
            $arrayElemAt: ["$district_data.districtName", 0],
          },
          channelGroupLabel: {
            $arrayElemAt: ["$channel_group.groupName", 0],
          },
          countryLabel: {
            $arrayElemAt: ["$country_data.countryName", 0],
          },
          channelCategoryLabel: {
            $arrayElemAt: ["$channel_category_data.channelCategory", 0],
          },

          stateLabel: {
            $arrayElemAt: ["$state_data.stateName", 0],
          },
          languageLabel: {
            $arrayElemAt: ["$language_data.languageName", 0],
          },
        },
      },
      {
        $unset: [
          "channel_category_data",
          "district_data",
          "channel_group",
          "country_data",
          "state_data",
          "language_data",
        ],
      },
    ];

    let userRoleData = await getUserRoleData(req, channelMasterService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.channelManagement,
      userRoleData,
      actionType.view
    );
    let dataExist = await channelMasterService.aggregateQuery(additionalQuery);
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
    if (!(await channelMasterService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "channelId",
      _id
    );

    if (deleteRefCheck.status === true) {
      let deleted = await channelMasterService.getOneAndDelete({ _id });
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
    let dataExist = await channelMasterService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await channelMasterService.getOneAndUpdate(
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
