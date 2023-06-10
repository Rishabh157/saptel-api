const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const dealerService = require("../../services/DealerService");
const companyService = require("../../services/CompanyService");
const dealersCategoryService = require("../../services/DealersCategoryService");

const { searchKeys } = require("../../model/DealerSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const bcryptjs = require("bcryptjs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  checkIdInCollectionsThenDelete,
  collectionArrToMatch,
} = require("../../helper/commonHelper");
const {
  dealerTokenCreate,
  dealerRefreshTokenCreate,
} = require("../../helper/tokenCreate");
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
      dealerCode,
      firmName,
      firstName,
      lastName,
      dealerCategoryId,
      email,
      registrationAddress,
      billingAddress,
      contactInformation,
      document,
      otherDocument,
      password,
      companyId,
      openingBalance,
    } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await dealerService.isExists([{ dealerCode }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    const isDealersCategoryExists = await dealersCategoryService.findCount({
      _id: dealerCategoryId,
      isDeleted: false,
    });
    if (!isDealersCategoryExists) {
      throw new ApiError(httpStatus.OK, "Invalid Dealers Category");
    }

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    let hashedPassword = await bcryptjs.hash(password, 12);
    if (!hashedPassword) {
      throw new ApiError(
        httpStatus.OK,
        `Something went wrong with the password.`
      );
    }
    req.body.password = hashedPassword;

    //------------------create data-------------------
    let dataCreated = await dealerService.createNewData({ ...req.body });

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
      dealerCode,
      firmName,
      firstName,
      lastName,
      dealerCategoryId,
      email,
      registrationAddress,
      billingAddress,
      contactInformation,
      document,
      otherDocument,
      password,
      companyId,
      openingBalance,
    } = req.body;

    let idToBeSearch = req.params.id;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    let dataExist = await dealerService.isExists(
      [{ dealerCode }],
      idToBeSearch,
      false
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------Find data-------------------
    let datafound = await dealerService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Dealer not found.`);
    }

    let dataUpdated = await dealerService.getOneAndUpdate(
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

//dealer login
exports.login = async (req, res) => {
  try {
    let reqEmail = req.body.email;
    let password = req.body.password;

    let dataFound = await dealerService.getOneByMultiField({ email: reqEmail });
    if (!dataFound) {
      throw new ApiError(httpStatus.OK, `Dealer not found.`);
    }
    let matched = await bcrypt.compare(password, dataFound.password);
    if (!matched) {
      throw new ApiError(httpStatus.OK, `Invalid Pasword!`);
    }
    let {
      _id: dealerId,
      // userType,
      firmName,
      firstName,
      lastName,
      dealerCode,
      email,
      companyId,
    } = dataFound;

    let token = await dealerTokenCreate(dataFound);
    if (!token) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    let refreshToken = await dealerRefreshTokenCreate(dataFound);
    if (!refreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }

    return res.status(httpStatus.OK).send({
      message: `Dealer Login successful!`,
      data: {
        token: token,
        refreshToken: refreshToken,
        userId: dealerId,
        firmName: firmName,
        dealerCode: dealerCode,
        fullName: `${firstName} ${lastName}`,
        email: email,
        companyId: companyId,
      },
      status: true,
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
exports.refreshToken = async (req, res) => {
  try {
    let refreshTokenValue = req.body.refreshToken;

    const decoded = await jwt.verify(
      refreshTokenValue,
      config.jwt_dealer_secret_refresh
    );
    if (!decoded) {
      throw new ApiError(httpStatus.OK, `Invalid refreshToken`);
    }

    let userData = await dealerService.getOneByMultiField({
      _id: decoded.Id,
      isDeleted: false,
    });
    if (!userData) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid token Dealer not found."
      );
    }

    let newToken = await dealerTokenCreate(userData);
    if (!newToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    let newRefreshToken = await dealerRefreshTokenCreate(userData);

    if (!newRefreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }

    return res.status(httpStatus.OK).send({
      message: `successfull!`,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
      status: true,
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
    let objectIdFields = ["dealerCategoryId", "companyId"];

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
          from: "dealerscategories",
          localField: "dealerCategoryId",
          foreignField: "_id",
          as: "dealerCategory_name",
          pipeline: [{ $project: { dealersCategory: 1 } }],
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "registrationAddress.countryId",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "registrationAddress.stateId",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "registrationAddress.districtId",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "registrationAddress.pincodeId",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      // billing section start
      {
        $lookup: {
          from: "countries",
          localField: "billingAddress.countryId",
          foreignField: "_id",
          as: "b_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "billingAddress.stateId",
          foreignField: "_id",
          as: "b_state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "billingAddress.districtId",
          foreignField: "_id",
          as: "b_district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "billingAddress.pincodeId",
          foreignField: "_id",
          as: "b_pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $addFields: {
          dealersCategoryName: {
            $arrayElemAt: ["$dealerCategory_name.dealersCategory", 0],
          },
          registrationCountryName: {
            $arrayElemAt: ["$country_name.countryName", 0],
          },
          registrationStateName: {
            $arrayElemAt: ["$state_name.stateName", 0],
          },
          registrationDistrictName: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
          registrationPincodeName: {
            $arrayElemAt: ["$pincode_name.pincode", 0],
          },
          //billing start
          billingAddressCountryName: {
            $arrayElemAt: ["$b_country_name.countryName", 0],
          },
          billingAddressStateName: {
            $arrayElemAt: ["$b_state_name.stateName", 0],
          },
          billingAddressDistrictName: {
            $arrayElemAt: ["$b_district_name.districtName", 0],
          },
          billingAddressPincodeName: {
            $arrayElemAt: ["$b_pincode_name.pincode", 0],
          },
        },
      },
      {
        $unset: [
          "dealerCategory_name",
          "country_name",
          "state_name",
          "district_name",
          "pincode_name",
          "b_country_name",
          "b_state_name",
          "b_district_name",
          "b_pincode_name",
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
    let dataFound = await dealerService.aggregateQuery(finalAggregateQuery);
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

    let result = await dealerService.aggregateQuery(finalAggregateQuery);
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
      { $match: matchQuery },
      {
        $lookup: {
          from: "dealerscategories",
          localField: "dealerCategory",
          foreignField: "_id",
          as: "dealerCategory_name",
          pipeline: [{ $project: { dealersCategory: 1 } }],
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "registrationAddress.country",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "registrationAddress.state",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "registrationAddress.district",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "registrationAddress.pincode",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      // billing section start
      {
        $lookup: {
          from: "countries",
          localField: "billingAddress.country",
          foreignField: "_id",
          as: "b_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "billingAddress.state",
          foreignField: "_id",
          as: "b_state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "billingAddress.district",
          foreignField: "_id",
          as: "b_district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "billingAddress.pincode",
          foreignField: "_id",
          as: "b_pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $addFields: {
          dealersCategoryName: {
            $arrayElemAt: ["$dealerCategory_name.dealersCategory", 0],
          },
          registrationCountryName: {
            $arrayElemAt: ["$country_name.countryName", 0],
          },
          registrationStateName: {
            $arrayElemAt: ["$state_name.stateName", 0],
          },
          registrationDistrictName: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
          registrationPincodeName: {
            $arrayElemAt: ["$pincode_name.pincode", 0],
          },
          //billing start
          billingAddressCountryName: {
            $arrayElemAt: ["$b_country_name.countryName", 0],
          },
          billingAddressStateName: {
            $arrayElemAt: ["$b_state_name.stateName", 0],
          },
          billingAddressDistrictName: {
            $arrayElemAt: ["$b_district_name.districtName", 0],
          },
          billingAddressPincodeName: {
            $arrayElemAt: ["$b_pincode_name.pincode", 0],
          },
        },
      },
      {
        $unset: [
          "dealerCategory_name",
          "country_name",
          "state_name",
          "district_name",
          "pincode_name",
          "b_country_name",
          "b_state_name",
          "b_district_name",
          "b_pincode_name",
        ],
      },
    ];
    let dataExist = await dealerService.aggregateQuery(additionalQuery);

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
        },
      },
      {
        $lookup: {
          from: "dealerscategories",
          localField: "dealerCategory",
          foreignField: "_id",
          as: "dealerCategory_name",
          pipeline: [{ $project: { dealersCategory: 1 } }],
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "registrationAddress.country",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "registrationAddress.state",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "registrationAddress.district",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "registrationAddress.pincode",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      // billing section start
      {
        $lookup: {
          from: "countries",
          localField: "billingAddress.country",
          foreignField: "_id",
          as: "b_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "billingAddress.state",
          foreignField: "_id",
          as: "b_state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "billingAddress.district",
          foreignField: "_id",
          as: "b_district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "billingAddress.pincode",
          foreignField: "_id",
          as: "b_pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $addFields: {
          dealersCategoryName: {
            $arrayElemAt: ["$dealerCategory_name.dealersCategory", 0],
          },
          registrationCountryName: {
            $arrayElemAt: ["$country_name.countryName", 0],
          },
          registrationStateName: {
            $arrayElemAt: ["$state_name.stateName", 0],
          },
          registrationDistrictName: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
          registrationPincodeName: {
            $arrayElemAt: ["$pincode_name.pincode", 0],
          },
          //billing start
          billingAddressCountryName: {
            $arrayElemAt: ["$b_country_name.countryName", 0],
          },
          billingAddressStateName: {
            $arrayElemAt: ["$b_state_name.stateName", 0],
          },
          billingAddressDistrictName: {
            $arrayElemAt: ["$b_district_name.districtName", 0],
          },
          billingAddressPincodeName: {
            $arrayElemAt: ["$b_pincode_name.pincode", 0],
          },
        },
      },
      {
        $unset: [
          "dealerCategory_name",
          "country_name",
          "state_name",
          "district_name",
          "pincode_name",
          "b_country_name",
          "b_state_name",
          "b_district_name",
          "b_pincode_name",
        ],
      },
    ];
    let dataExist = await dealerService.aggregateQuery(additionalQuery);
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
    if (!(await dealerService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "dealerId",
      _id
    );

    if (deleteRefCheck.status === true) {
      let deleted = await dealerService.getOneAndDelete({ _id });
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
    let dataExist = await dealerService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await dealerService.getOneAndUpdate(
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
