const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const websiteMetaTagService = require("../../services/WebsiteMetaTagService");
const companyService = require("../../services/CompanyService");
const websiteMasterService = require("../../services/WebsiteMasterService");
const websitPageService = require("../../services/WebsitePageService");
const { searchKeys } = require("../../model/WebsiteMetaTagSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
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
const mongoose = require("mongoose");

// ============= add  start  ================
exports.add = async (req, res) => {
  try {
    let {
      websitPageId,
      websiteMasterId,
      companyId,
      metaDescription,
      metaKeyword,
      metaOgTitle,
      metaOgUrl,
      metaOgImage,
      metaOgDescription,
      metaOgType,
      metaTwitterTitle,
      metaTwitterCard,
      metaTwitterImage,
    } = req.body;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });

    console.log(isCompanyExists)
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    const isWebsiteMasterExists = await websiteMasterService.findCount({
      _id: websiteMasterId,
      isDeleted: false,
    });
    if (!isWebsiteMasterExists) {
      throw new ApiError(httpStatus.OK, "Invalid Website Master");
    }
    const isWebsitPageExists = await websitPageService.findCount({
      _id: websitPageId,
      isDeleted: false,
    });
    if (!isWebsitPageExists) {
      throw new ApiError(httpStatus.OK, "Invalid Websit Page.");
    }

    //------------------create data-------------------
    let dataCreated = await websiteMetaTagService.createNewData({
      ...req.body,
    });

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
// =============add  start end================

// =============update  start================
exports.update = async (req, res) => {
  try {
    let {
      websitPageId,
      websiteMasterId,
      metaDescription,
      metaKeyword,
      metaOgTitle,
      metaOgUrl,
      metaOgImage,
      metaOgDescription,
      metaOgType,
      metaTwitterTitle,
      metaTwitterCard,
      metaTwitterImage,
      companyId,
    } = req.body;

    let idToBeSearch = req.params.id;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    const isWebsiteMasterExists = await websiteMasterService.findCount({
      _id: websiteMasterId,
      isDeleted: false,
    });
    if (!isWebsiteMasterExists) {
      throw new ApiError(httpStatus.OK, "Invalid Website Master");
    }
    const isWebsitPageExists = await websitPageService.findCount({
      _id: websitPageId,
      isDeleted: false,
    });

    //------------------Find data-------------------
    let datafound = await websiteMetaTagService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `WebsiteMetaTag not found.`);
    }

    let dataUpdated = await websiteMetaTagService.getOneAndUpdate(
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
// =============update Disposition end================

// =============all filter pagination api start================
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
    let objectIdFields = ["websitPageId", "websiteMasterId", "companyId"];

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
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "websitemasters",
          localField: "websiteMasterId",
          foreignField: "_id",
          as: "websiteMasterData",
          pipeline: [
            {
              $project: {
                productName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "websitepages",
          localField: "websitPageId",
          foreignField: "_id",
          as: "websitePageData",
          pipeline: [
            {
              $project: {
                pageName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          websiteMasterLabel: {
            $arrayElemAt: ["$websiteMasterData.productName", 0],
          },
          websitePageLabel: {
            $arrayElemAt: ["$websitePageData.pageName", 0],
          },
        },
      },
      {
        $unset: ["websiteMasterData", "websitePageData"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await websiteMetaTagService.aggregateQuery(
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

    let result = await websiteMetaTagService.aggregateQuery(
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
// =============all filter pagination api end================

// =============get ALl api start================
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
          from: "websitemasters",
          localField: "websiteMasterId",
          foreignField: "_id",
          as: "websiteMasterData",
          pipeline: [
            {
              $project: {
                productName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "websitepages",
          localField: "websitPageId",
          foreignField: "_id",
          as: "websitePageData",
          pipeline: [
            {
              $project: {
                pageName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          websiteMasterLabel: {
            $arrayElemAt: ["$websiteMasterData.productName", 0],
          },
          websitePageLabel: {
            $arrayElemAt: ["$websitePageData.pageName", 0],
          },
        },
      },
      {
        $unset: ["websiteMasterData", "websitePageData"],
      },
    ];
    let dataExist = await websiteMetaTagService.aggregateQuery(additionalQuery);

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
// =============get ALl api end================

// =============getbyid api start================
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
          from: "websitemasters",
          localField: "websiteMasterId",
          foreignField: "_id",
          as: "websiteMasterData",
          pipeline: [
            {
              $project: {
                productName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "websitepages",
          localField: "websitPageId",
          foreignField: "_id",
          as: "websitePageData",
          pipeline: [
            {
              $project: {
                pageName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          websiteMasterLabel: {
            $arrayElemAt: ["$websiteMasterData.productName", 0],
          },
          websitePageLabel: {
            $arrayElemAt: ["$websitePageData.pageName", 0],
          },
        },
      },
      {
        $unset: ["websiteMasterData", "websitePageData"],
      },
    ];
    let dataExist = await websiteMetaTagService.aggregateQuery(additionalQuery);

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
// =============getbyid api end================

// =============delete api start================
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await websiteMetaTagService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    const deleteRefCheck = await checkIdInCollectionsThenDelete(collectionArrToMatch, 'websiteMetaTagId', _id)

    if (deleteRefCheck.status === true) {
      let deleted = await websiteMetaTagService.getOneAndDelete({ _id });
      if (!deleted) {
        throw new ApiError(httpStatus.OK, "Some thing went wrong.");
      }
    }
    return res.status(httpStatus.OK).send({
      message: deleteRefCheck.message,
      status: true,
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
// =============delete api end================

// =============statusChange api start================

exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await websiteMetaTagService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await websiteMetaTagService.getOneAndUpdate(
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
// =============statusChange api end================
