const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const channelMasterService = require("../../services/ChannelMasterService");
const { searchKeys } = require("../../model/ChannelMasterSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const districtService = require("../../services/DistrictService");
const channelGroupService = require("../../services/ChannelGroupService");
const stateService = require("../../services/StateService");
const countryService = require("../../services/CountryService");
const channelCategoryService = require("../../services/ChannelCategoryService");
const languageService = require("../../services/LanguageService");
const companyService = require("../../services/CompanyService");
const slotMasterService = require("../../services/SlotMasterService");

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
      channelName,
      address,
      phone,
      email,
      district,
      channelGroupId,
      contactPerson,
      mobile,
      country,
      language,
      channelCategory,
      designation,
      website,
      state,
      paymentType,
      companyId,
    } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await channelMasterService.isExists([{ channelName }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    const isAreaExists = await districtService.findCount({
      _id: district,
      isDeleted: false,
    });
    const isChannelGroupExists = await channelGroupService.findCount({
      _id: channelGroupId,
      isDeleted: false,
    });
    const isStateExists = await stateService.findCount({
      _id: state,
      isDeleted: false,
    });
    const isCountryExists = await countryService.findCount({
      _id: country,
      isDeleted: false,
    });
    const isChannelCategoryExists = await channelCategoryService.findCount({
      _id: channelCategory,
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
    if (!isAreaExists) {
      throw new ApiError(httpStatus.OK, "Invalid district");
    }
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    if (!isChannelGroupExists) {
      throw new ApiError(httpStatus.OK, "Invalid channel group");
    }
    if (!isStateExists) {
      throw new ApiError(httpStatus.OK, "Invalid state");
    }
    if (!isCountryExists) {
      throw new ApiError(httpStatus.OK, "Invalid country");
    }
    if (!isChannelCategoryExists) {
      throw new ApiError(httpStatus.OK, "Invalid channel category");
    }
    if (languageService?.length && !isLanguageExists) {
      throw new ApiError(httpStatus.OK, "Invalid Language");
    }
    //------------------create data-------------------
    let dataCreated = await channelMasterService.createNewData({ ...req.body });

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
      channelName,
      address,
      phone,
      email,
      district,
      channelGroupId,
      contactPerson,
      mobile,
      country,
      language,
      channelCategory,
      designation,
      website,
      state,
      paymentType,
      companyId,
    } = req.body;

    let idToBeSearch = req.params.id;

    //------------------Find data-------------------
    let datafound = await channelMasterService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `ChannelMaster not found.`);
    }
    const isAreaExists = await districtService.findCount({
      _id: district,
      isDeleted: false,
    });
    const isChannelGroupExists = await channelGroupService.findCount({
      _id: channelGroupId,
      isDeleted: false,
    });
    const isStateExists = await stateService.findCount({
      _id: state,
      isDeleted: false,
    });
    const isCountryExists = await countryService.findCount({
      _id: country,
      isDeleted: false,
    });
    const isChannelCategoryExists = await channelCategoryService.findCount({
      _id: channelCategory,
      isDeleted: false,
    });
    const isLanguageExists = languageService?.length
      ? await languageService.findCount({
          _id: language,
          isDeleted: false,
        })
      : null;
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    if (!isAreaExists) {
      throw new ApiError(httpStatus.OK, "Invalid district");
    }
    if (!isChannelGroupExists) {
      throw new ApiError(httpStatus.OK, "Invalid channel group");
    }
    if (!isStateExists) {
      throw new ApiError(httpStatus.OK, "Invalid state");
    }
    if (!isCountryExists) {
      throw new ApiError(httpStatus.OK, "Invalid country");
    }
    if (!isChannelCategoryExists) {
      throw new ApiError(httpStatus.OK, "Invalid channel category");
    }
    if (languageService?.length && !isLanguageExists) {
      throw new ApiError(httpStatus.OK, "Invalid Language");
    }

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
      "channelName",
      "address",
      "phone",
      "email",
      "area",
      "channelGroupId",
      "contactPerson",
      "mobile",
      "country",
      "language",
      "channelCategory",
      "designation",
      "website",
      "state",
      "paymentType",
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

    let result = await channelMasterService.aggregateQuery(finalAggregateQuery);
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
    let dataExist = await channelMasterService.aggregateQuery(additionalQuery);

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
    let dataExist = await channelMasterService.aggregateQuery(additionalQuery);
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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await channelMasterService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const isChannelExistsInSlot = await slotMasterService.findCount({
      channelName: _id,
      isDeleted: false,
    });

    if (isChannelExistsInSlot) {
      throw new ApiError(
        httpStatus.OK,
        "Channel can't be deleted because it is currently used in other services"
      );
    }
    let deleted = await channelMasterService.getOneAndDelete({ _id });
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
