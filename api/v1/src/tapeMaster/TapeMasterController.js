const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const tapeMasterService = require("./TapeMasterService");
const { searchKeys } = require("./TapeMasterSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const schemeService = require("../scheme/SchemeService");
const companyService = require("../company/CompanyService");
const languageService = require("../language/LanguageService");
const slotMasterService = require("../slotMaster/SlotMasterService");
const artistService = require("../artist/ArtistService");
const { checkIdInCollectionsThenDelete, collectionArrToMatch } = require("../../helper/commonHelper")

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
      tapeName,
      tapeType,
      schemeId,
      languageId,
      artistId,
      companyId,
      phone,
      duration,
      youtubeLink,
      webSiteLink,
      remarks,
    } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await tapeMasterService.isExists([{ tapeName }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    const isLanguageExists = await languageService.findCount({
      _id: languageId,
      isDeleted: false,
    });

    if (!isLanguageExists) {
      throw new ApiError(httpStatus.OK, "Invalid language");
    }

    const isArtistExists = await artistService.findCount({
      _id: artistId,
      isDeleted: false,
    });

    if (!isArtistExists) {
      throw new ApiError(httpStatus.OK, "Invalid Artist");
    }

    const isSchemeExists = schemeId?.length
      ? await schemeService.findCount({
        _id: schemeId,
        isDeleted: false,
      })
      : null;

    if (schemeId?.length && !isSchemeExists) {
      throw new ApiError(httpStatus.OK, "Invalid scheme");
    }

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    //------------------create data-------------------
    let dataCreated = await tapeMasterService.createNewData({ ...req.body });

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
      tapeName,
      tapeType,
      schemeId,
      languageId,
      artistId,
      companyId,
      phone,
      duration,
      youtubeLink,
      webSiteLink,
      remarks,
    } = req.body;

    let idToBeSearch = req.params.id;

    //------------------Find data-------------------
    let datafound = await tapeMasterService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `TapeMaster not found.`);
    }

    const isLanguageExists = await languageService.findCount({
      _id: languageId,
      isDeleted: false,
    });
    if (!isLanguageExists) {
      throw new ApiError(httpStatus.OK, "Invalid language");
    }

    const isArtistExists = await artistService.findCount({
      _id: artistId,
      isDeleted: false,
    });
    if (!isArtistExists) {
      throw new ApiError(httpStatus.OK, "Invalid Artist");
    }

    const isSchemeExists = schemeId?.length
      ? await schemeService.findCount({
        _id: schemeId,
        isDeleted: false,
      })
      : null;

    if (schemeId?.length && !isSchemeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Scheme");
    }

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    let dataUpdated = await tapeMasterService.getOneAndUpdate(
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
    let objectIdFields = ["schemeId", "languageId", "artistId", "companyId"];

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
          from: "languages",
          localField: "languageId",
          foreignField: "_id",
          as: "languageId",
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
        $lookup: {
          from: "artists",
          localField: "artistId",
          foreignField: "_id",
          as: "artistId",
          pipeline: [
            {
              $project: {
                artistName: 1,
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
          // languageLabel: {
          //   $arrayElemAt: ["$language_data.languageName", 0],
          // },
        },
      },
      {
        $unset: ["scheme_data"],
      },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await tapeMasterService.aggregateQuery(finalAggregateQuery);
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

    let result = await tapeMasterService.aggregateQuery(finalAggregateQuery);
    if (result.length) {
      return res.status(200).send({
        data: result,
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
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "channelgroups",
          localField: "channelGroupId",
          foreignField: "_id",
          as: "channel_group_data",
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
          from: "languages",
          localField: "languageId",
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
        $lookup: {
          from: "artists",
          localField: "artistId",
          foreignField: "_id",
          as: "artistId",
          pipeline: [
            {
              $project: {
                artistName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          channelGroupLabel: {
            $arrayElemAt: ["$channel_group_data.groupName", 0],
          },
          schemeLabel: {
            $arrayElemAt: ["$scheme_data.schemeName", 0],
          },
          languageLabel: {
            $arrayElemAt: ["$language_data.languageName", 0],
          },
        },
      },
      {
        $unset: ["channel_group_data", "scheme_data", "language_data"],
      },
    ];
    let dataExist = await tapeMasterService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist.length) {
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
//get by id api
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
          from: "channelgroups",
          localField: "channelGroupId",
          foreignField: "_id",
          as: "channel_group_data",
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
          from: "languages",
          localField: "languageId",
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
        $lookup: {
          from: "artists",
          localField: "artistId",
          foreignField: "_id",
          as: "artistId",
          pipeline: [
            {
              $project: {
                artistName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          channelGroupLabel: {
            $arrayElemAt: ["$channel_group_data.groupName", 0],
          },
          schemeLabel: {
            $arrayElemAt: ["$scheme_data.schemeName", 0],
          },
          languageLabel: {
            $arrayElemAt: ["$language_data.languageName", 0],
          },
        },
      },
      {
        $unset: ["channel_group_data", "scheme_data", "language_data"],
      },
    ];

    let dataExist = await tapeMasterService.aggregateQuery(additionalQuery);

    if (!dataExist) {
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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await tapeMasterService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const deleteRefCheck = await checkIdInCollectionsThenDelete(collectionArrToMatch, 'tapeNameId', _id)

    if (deleteRefCheck.status === true) {
      let deleted = await tapeMasterService.getOneAndDelete({ _id });
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
    let dataExist = await tapeMasterService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await tapeMasterService.getOneAndUpdate(
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
