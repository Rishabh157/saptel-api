const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const schemeService = require("./SchemeService");
const companyService = require("../company/CompanyService");
const dealerSchemeService = require("../dealerScheme/DealerSchemeService");
const { searchKeys } = require("./SchemeSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const tapeMasterService = require("../tapeMaster/TapeMasterService");
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
    let {
      // schemeCode,
      schemeName,
      category,
      commission,
      subCategory,
      schemePrice,
      dimension,
      weight,
      deliveryCharges,
      comboPacking,
      startDate,
      endDate,
      schemeDescription,
      productInformation,
      faq,
      companyId,
    } = req.body;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    let lastObject = await schemeService.aggregateQuery([
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    let schemeCode = "";
    if (!lastObject.length) {
      schemeCode = "SC00001";
    } else {
      const lastSchemeCode = lastObject[0]?.schemeCode || "SC00000";
      const lastNumber = parseInt(lastSchemeCode.replace("SC", ""), 10);
      const nextNumber = lastNumber + 1;
      schemeCode = "SC" + String(nextNumber).padStart(5, "0");
    }
    /**
     * check duplicate exist
     */
    let dataExist = await schemeService.isExists([
      { schemeCode },
      { schemeName },
    ]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------
    let dataCreated = await schemeService.createNewData({
      ...req.body,
      schemeCode,
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

//update start
exports.update = async (req, res) => {
  try {
    let {
      schemeName,
      category,
      commission,
      subCategory,
      schemePrice,
      dimension,
      weight,
      deliveryCharges,
      comboPacking,
      startDate,
      endDate,
      schemeDescription,
      productInformation,
      faq,
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

    let dataExist = await schemeService.isExists(
      [{ schemeName }],
      idToBeSearch,
      false
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    //------------------Find data-------------------
    let datafound = await schemeService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Scheme not found.`);
    }

    let dataUpdated = await schemeService.getOneAndUpdate(
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
    let booleanFields = ["comboPacking"];
    let numberFileds = [
      "schemeCode",
      "schemeName",
      "startDate",
      "endDate",
      "schemeDescription",
    ];
    let objectIdFields = ["category", "subCategory", "companyId"];

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
          from: "productcategories",
          localField: "category",
          foreignField: "_id",
          as: "parent_name",
          pipeline: [{ $project: { categoryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "productsubcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "sub_category_name",
          pipeline: [{ $project: { subCategoryName: 1 } }],
        },
      },

      {
        $addFields: {
          productCategoryLabel: {
            $arrayElemAt: ["$parent_name.categoryName", 0],
          },
          ProductSubCategoryLabel: {
            $arrayElemAt: ["$sub_category_name.subCategoryName", 0],
          },
        },
      },
      {
        $unset: ["parent_name", "sub_category_name"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await schemeService.aggregateQuery(finalAggregateQuery);
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
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.scheme,
      userRoleData,
      actionType.pagination
    );
    let result = await schemeService.aggregateQuery(finalAggregateQuery);
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
      isActive: true,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "productcategories",
          localField: "category",
          foreignField: "_id",
          as: "parent_name",
          pipeline: [{ $project: { categoryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "productsubcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "sub_category_name",
          pipeline: [{ $project: { subCategoryName: 1 } }],
        },
      },

      {
        $addFields: {
          productCategoryLabel: {
            $arrayElemAt: ["$parent_name.categoryName", 0],
          },
          ProductSubCategoryLabel: {
            $arrayElemAt: ["$sub_category_name.subCategoryName", 0],
          },
        },
      },
      {
        $unset: ["parent_name", "sub_category_name"],
      },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.scheme,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await schemeService.aggregateQuery(additionalQuery);
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

// get dealer wise scheme
exports.getDealerWiseScheme = async (req, res) => {
  try {
    let companyId = req.userData.companyId;
    let dealerId = req.params.dealerId;
    //if no default query then pass {}
    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false,
      isActive: true,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      { $project: { schemeName: 1 } },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.scheme,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await schemeService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);
    let alreadyHaveScheme = [];
    let notAssignedScheme = [];

    await Promise.all(
      allowedFields?.map(async (ele) => {
        let dealerSchemeFound = await dealerSchemeService?.getOneByMultiField({
          isDeleted: false,
          isActive: true,
          dealerId: dealerId,
          schemeId: ele?._id,
        });
        if (dealerSchemeFound) {
          alreadyHaveScheme.push({
            value: ele?._id,
            label: ele?.schemeName,
            flag: true,
          });
        } else {
          notAssignedScheme.push({
            value: ele?._id,
            label: ele?.schemeName,
            flag: false,
          });
        }
      })
    );

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      alreadyHaveScheme: alreadyHaveScheme,
      notAssignedScheme: notAssignedScheme,
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

//get api
exports.getByProductGroup = async (req, res) => {
  try {
    let companyId = req.params.companyid;
    let pgid = req.params.pgid;
    //if no default query then pass {}
    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false,
      isActive: true,
    };
    matchQuery["productInformation.productGroup"] = pgid;

    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "productcategories",
          localField: "category",
          foreignField: "_id",
          as: "parent_name",
          pipeline: [{ $project: { categoryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "productsubcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "sub_category_name",
          pipeline: [{ $project: { subCategoryName: 1 } }],
        },
      },

      {
        $addFields: {
          productCategoryLabel: {
            $arrayElemAt: ["$parent_name.categoryName", 0],
          },
          ProductSubCategoryLabel: {
            $arrayElemAt: ["$sub_category_name.subCategoryName", 0],
          },
        },
      },
      {
        $unset: ["parent_name", "sub_category_name"],
      },
    ];

    let dataExist = await schemeService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist?.length) {
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

//single view api
exports.getById = async (req, res) => {
  try {
    //if no default query then pass {}
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
          from: "productcategories",
          localField: "category",
          foreignField: "_id",
          as: "parent_name",
          pipeline: [{ $project: { categoryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "productsubcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "sub_category_name",
          pipeline: [{ $project: { subCategoryName: 1 } }],
        },
      },

      {
        $addFields: {
          productCategoryLabel: {
            $arrayElemAt: ["$parent_name.categoryName", 0],
          },
          ProductSubCategoryLabel: {
            $arrayElemAt: ["$sub_category_name.subCategoryName", 0],
          },
        },
      },
      {
        $unset: ["parent_name", "sub_category_name"],
      },
    ];
    let dataExist = await schemeService.aggregateQuery(additionalQuery);
    if (!dataExist.length) {
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
    if (!(await schemeService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "scheme",
      _id
    );

    if (deleteRefCheck.status === true) {
      let deleted = await schemeService.getOneAndDelete({ _id });
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
    let dataExist = await schemeService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await schemeService.getOneAndUpdate(
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
