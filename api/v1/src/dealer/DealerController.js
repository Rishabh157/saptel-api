const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const dealerService = require("./DealerService");
const warehouseService = require("../wareHouse/WareHouseService");
const dealerSchemeService = require("../dealerScheme/DealerSchemeService");
const companyService = require("../company/CompanyService");
const dealersCategoryService = require("../dealersCategory/DealersCategoryService");
const ledgerService = require("../ledger/LedgerService");
const { searchKeys } = require("./DealerSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const bcryptjs = require("bcryptjs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  ledgerType,
  moduleType,
  actionType,
} = require("../../helper/enumUtils");

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
      creditLimit,
      openingBalance,
      isAutoMapping,
      isCheckCreditLimit,
      isCheckAvailableQuotient,
      quantityQuotient,
      zonalManagerId,
      zonalExecutiveId,
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

    req.body.registrationAddress.maskedPhoneNo =
      "******" + req.body.registrationAddress.phone.substring(6);
    req.body.billingAddress.maskedPhoneNo =
      "******" + req.body.billingAddress.phone.substring(6);

    const updatedContactInformation = contactInformation.map((contact) => {
      const maskedPhoneNo = "******" + contact.mobileNumber.slice(-4);
      return { ...contact, maskedPhoneNo };
    });
    req.body.contactInformation = updatedContactInformation;
    //------------------create data-------------------
    let dataCreated = await dealerService.createNewData({ ...req.body });

    if (dataCreated._id) {
      let ledgerCreated = await ledgerService.createNewData({
        noteType: ledgerType.dealerAmountCredited,
        creditAmount: openingBalance,
        debitAmount: 0,
        remark: "Opening Balance",
        dealerId: dataCreated._id,
        companyId: companyId,
        balance: openingBalance,
      });
    }

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
      creditLimit,
      openingBalance,
      isAutoMapping,
      isCheckCreditLimit,
      isCheckAvailableQuotient,
      zonalManagerId,
      zonalExecutiveId,
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

    req.body.registrationAddress.maskedPhoneNo =
      "******" + req.body.registrationAddress.phone.substring(6);
    req.body.billingAddress.maskedPhoneNo =
      "******" + req.body.billingAddress.phone.substring(6);

    const updatedContactInformation = contactInformation.map((contact) => {
      const maskedPhoneNo = "******" + contact.mobileNumber.slice(-4);
      return { ...contact, maskedPhoneNo };
    });
    req.body.contactInformation = updatedContactInformation;

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
    let dealerCode = req.body.dealerCode;
    let password = req.body.password;
    let dataFound = await dealerService.getOneByMultiField({
      dealerCode: dealerCode,
    });
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
      email,
      companyId,
    } = dataFound;

    let dealerWarehouse = await warehouseService.getOneByMultiField({
      isDeleted: false,
      dealerId: dealerId,
    });

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
        warehouseId: dealerWarehouse?._id ? dealerWarehouse?._id : null,
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
        $lookup: {
          from: "users",
          localField: "zonalManagerId",
          foreignField: "_id",
          as: "zonalManager",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "zonalExecutiveId",
          foreignField: "_id",
          as: "zonalExecutive",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $addFields: {
          zonalManagerLabel: {
            $concat: [
              { $arrayElemAt: ["$zonalManager.firstName", 0] },
              " ",
              { $arrayElemAt: ["$zonalManager.lastName", 0] },
            ],
          },
          zonalExecutiveLabel: {
            $concat: [
              { $arrayElemAt: ["$zonalExecutive.firstName", 0] },
              " ",
              { $arrayElemAt: ["$zonalExecutive.lastName", 0] },
            ],
          },
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
          "zonalExecutive",
          "zonalManager",
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

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.wareHouse,
      userRoleData,
      actionType.pagination
    );

    let result = await dealerService.aggregateQuery(finalAggregateQuery);
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
        $lookup: {
          from: "users",
          localField: "zonalManagerId",
          foreignField: "_id",
          as: "zonalManager",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "zonalExecutiveId",
          foreignField: "_id",
          as: "zonalExecutive",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $addFields: {
          zonalManagerLabel: {
            $concat: [
              { $arrayElemAt: ["$zonalManager.firstName", 0] },
              " ",
              { $arrayElemAt: ["$zonalManager.lastName", 0] },
            ],
          },
          zonalExecutiveLabel: {
            $concat: [
              { $arrayElemAt: ["$zonalExecutive.firstName", 0] },
              " ",
              { $arrayElemAt: ["$zonalExecutive.lastName", 0] },
            ],
          },
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
          "zonalExecutive",
          "zonalManager",
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

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.wareHouse,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await dealerService.aggregateQuery(additionalQuery);
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

// get scheme wise dealer
exports.getSchemeWiseDealer = async (req, res) => {
  try {
    let companyId = req.userData.companyId;
    let schemeId = req.params.schemeId;
    //if no default query then pass {}
    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false,
      isActive: true,
      isApproved: true,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      { $project: { firstName: 1, lastName: 1 } },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.dealer,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await dealerService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);
    let alreadyHaveScheme = [];
    let notAssignedScheme = [];

    await Promise.all(
      allowedFields?.map(async (ele) => {
        let dealerSchemeFound = await dealerSchemeService?.getOneByMultiField({
          isDeleted: false,
          isActive: true,
          dealerId: ele?._id,
          schemeId: schemeId,
        });
        if (dealerSchemeFound) {
          alreadyHaveScheme.push({
            value: ele?._id,
            label: ele?.firstName + " " + ele?.lastName,
            flag: true,
          });
        } else {
          notAssignedScheme.push({
            value: ele?._id,
            label: ele?.firstName + " " + ele?.lastName,
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
exports.getByPincode = async (req, res) => {
  try {
    let companyId = req.params.companyid;
    let pincodeId = req.params.pincodeid;

    //if no default query then pass {}
    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(companyId),
      "registrationAddress.pincodeId": new mongoose.Types.ObjectId(pincodeId),
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
        $lookup: {
          from: "users",
          localField: "zonalManagerId",
          foreignField: "_id",
          as: "zonalManager",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "zonalExecutiveId",
          foreignField: "_id",
          as: "zonalExecutive",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $addFields: {
          zonalManagerLabel: {
            $concat: [
              { $arrayElemAt: ["$zonalManager.firstName", 0] },
              " ",
              { $arrayElemAt: ["$zonalManager.lastName", 0] },
            ],
          },
          zonalExecutiveLabel: {
            $concat: [
              { $arrayElemAt: ["$zonalExecutive.firstName", 0] },
              " ",
              { $arrayElemAt: ["$zonalExecutive.lastName", 0] },
            ],
          },
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
          "zonalExecutive",
          "zonalManager",
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

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.wareHouse,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await dealerService.aggregateQuery(additionalQuery);
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
        $lookup: {
          from: "users",
          localField: "zonalManagerId",
          foreignField: "_id",
          as: "zonalManager",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "zonalExecutiveId",
          foreignField: "_id",
          as: "zonalExecutive",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $addFields: {
          zonalManagerLabel: {
            $concat: [
              { $arrayElemAt: ["$zonalManager.firstName", 0] },
              " ",
              { $arrayElemAt: ["$zonalManager.lastName", 0] },
            ],
          },
          zonalExecutiveLabel: {
            $concat: [
              { $arrayElemAt: ["$zonalExecutive.firstName", 0] },
              " ",
              { $arrayElemAt: ["$zonalExecutive.lastName", 0] },
            ],
          },
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
          "zonalExecutive",
          "zonalManager",
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
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.wareHouse,
      userRoleData,
      actionType.view
    );
    let dataExist = await dealerService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields?.length) {
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

//dealer approval

exports.dealerApproval = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await dealerService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let statusChanged = await dealerService.getOneAndUpdate(
      { _id },
      { isActive: true, isApproved: true }
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

exports.changeAutoMapping = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await dealerService.getOneByMultiField({
      _id: _id,
    });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, `Dealer not found.`);
    }
    let autoMapping = dataExist.autoMapping ? false : true;
    let approvedStatusChange = await dealerService.getOneAndUpdate(
      {
        _id: _id,
        isDeleted: false,
      },
      {
        $set: { autoMapping },
      }
    );

    if (approvedStatusChange) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: approvedStatusChange,
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

exports.changePassword = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const { currentPassword, newPassword, dealerEmail } = req.body;
    const decoded = await jwt.verify(token, config.jwt_dealer_secret);
    if (decoded.email !== dealerEmail) {
      throw new ApiError(httpStatus.OK, `Invalid Token`);
    }
    const dealer = await dealerService.getOneByMultiField({
      email: dealerEmail,
      isDeleted: false,
    }); // assuming you're using Passport.js or similar for authentication

    let {
      _id: dealerId,
      // dealerType,
      firmName,
      firstName,
      lastName,
      dealerCode,
      email,
      companyId,
    } = dealer;

    let dealerWarehouse = await warehouseService.getOneByMultiField({
      isDeleted: false,
      dealerId: dealerId,
    });
    // Check if the current password matches the dealer's password
    const isMatch = await bcrypt.compare(currentPassword, dealer.password);
    if (!isMatch) {
      throw new ApiError(httpStatus.OK, `Current password not matched`);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the dealer's password in the database
    dealer.password = hashedPassword;
    await dealer.save();

    let newToken = await dealerTokenCreate(dealer);
    if (!newToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    let newRefreshToken = await dealerRefreshTokenCreate(dealer);

    if (!newRefreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }

    return res.status(httpStatus.OK).send({
      message: `Password change successful!`,
      data: {
        token: token,
        refreshToken: newRefreshToken,
        userId: dealerId,
        firmName: firmName,
        dealerCode: dealerCode,
        fullName: `${firstName} ${lastName}`,
        email: email,
        companyId: companyId,
        warehouseId: dealerWarehouse?._id ? dealerWarehouse?._id : null,
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

exports.changeDealerPassword = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    const { newPassword, dealerCode } = req.body;

    const dealer = await dealerService.getOneByMultiField({
      dealerCode: dealerCode,
      isDeleted: false,
    }); // assuming you're using Passport.js or similar for authentication
    if (!dealer) {
      throw new ApiError(httpStatus.OK, `Invalid dealer`);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the dealer's password in the database
    dealer.password = hashedPassword;
    await dealer.save();

    return res.status(httpStatus.OK).send({
      message: `Password change successful!`,
      data: null,
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
