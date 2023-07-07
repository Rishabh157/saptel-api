const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const userService = require("./UserService");
const companyService = require("../company/CompanyService");
const {
  checkIdInCollectionsThenDelete,
  collectionArrToMatch,
} = require("../../helper/commonHelper");

const { searchKeys } = require("./UserSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const bcryptjs = require("bcryptjs");
const otpHelper = require("../otp/OtpHelper");
const { sendMsg91Function } = require("../../helper/msgHelper");
const {
  tokenCreate,
  otpTokenCreate,
  refreshTokenCreate,
} = require("../../helper/tokenCreate");
const { isAfter } = require("date-fns");
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const { userEnum } = require("../../helper/enumUtils");

//add start
exports.add = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      userName,
      mobile,
      email,
      companyId,
      password,
      userDepartment,
      userRole,
    } = req.body;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    /**
     * check duplicate exist
     */
    let dataExist = await userService.isExists([
      { email },
      { mobile },
      { userName },
    ]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    // let randomPassword = generateRandomPassword();
    let hashedPassword = await bcryptjs.hash(password, 12);
    if (!hashedPassword) {
      throw new ApiError(
        httpStatus.OK,
        `Something went wrong with the password.`
      );
    }
    req.body.password = hashedPassword;
    // let dataToUpload = { ...req.body, password: hashedPassword };
    // console.log(dataToUpload);
    //------------------create data-------------------
    let dataCreated = await userService.createNewData({ ...req.body });

    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: `User added successfull`,
        data: {
          fullName: `${firstName} ${lastName}`,
          email: email,
          mobile: mobile,
          companyId: companyId,
          userType: userEnum.user,
          userDepartment: userDepartment,
          userRole: userRole,
        },
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

//update start
exports.update = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      mobile,
      email,
      companyId,
      userDepartment,
      userRole,
    } = req.body;
    if (req.userData.userType !== userEnum.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `You do not have authority to access this.`
      );
    }

    let idToBeSearch = req.userData.Id;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    /**
     * check duplicate exist
     */
    let dataExist = await userService.isExists(
      [{ email }, { mobile }],
      [idToBeSearch]
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    //------------------Find data-------------------
    let datafound = await userService.getOneByMultiField({ _id: idToBeSearch });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `User not found.`);
    }

    let dataUpdated = await userService.getOneAndUpdate(
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

//update start
exports.updateUser = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      userName,
      mobile,
      email,
      password,
      companyId,
      userDepartment,
      userRole,
    } = req.body;
    // if (req.userData.userType !== userEnum.user) {
    //   throw new ApiError(
    //     httpStatus.UNAUTHORIZED,
    //     `You do not have authority to access this.`
    //   );
    // }

    let idToBeSearch = req.params.id;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    /**
     * check duplicate exist
     */
    let dataExist = await userService.isExists(
      [{ email }, { mobile }, { userName }],
      [idToBeSearch]
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    //------------------Find data-------------------
    let datafound = await userService.getOneByMultiField({ _id: idToBeSearch });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `User not found.`);
    }
    if (password) {
      let hashedPassword = await bcryptjs.hash(password, 12);
      if (!hashedPassword) {
        throw new ApiError(
          httpStatus.OK,
          `Something went wrong with the password.`
        );
      }
      req.body.password = hashedPassword;
    }

    let dataUpdated = await userService.getOneAndUpdate(
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
    if (req.userData.userType === userEnum.user) {
      matchQuery.$and.push({ _id: mongoose.Types.ObjectId(req.userData.Id) });
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
    let booleanFields = ["isActive"];
    let numberFileds = [];
    let objectIdFileds = ["companyId"];
    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFileds
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
    let additionalQuery = [];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await userService.aggregateQuery(finalAggregateQuery);
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

    let result = await userService.aggregateQuery(finalAggregateQuery);
    if (result.length) {
      return res.status(httpStatus.OK).send({
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
      companyId: companyId,
      isDeleted: false,
    };
    if (req.userData.userType === userEnum.user) {
      matchQuery["_id"] = req.userData.Id;
    }
    if (
      req.userData.userType !== userEnum.user &&
      req.query &&
      Object.keys(req.query).length
    ) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let dataExist = await userService.findAllWithQuery(matchQuery);

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
    let dataExist = await userService.getOneByMultiField({
      _id: idToBeSearch,
      isDeleted: false,
    });

    if (!dataExist) {
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

exports.gatAllDistributionUser = async (req, res) => {
  try {
    let companyId = req.params.companyid;
    let role = req.params.role;
    let userRole = [];
    if (role === "manager") {
      userRole.push("SR_MANAGER_DISTRIBUTION");
      userRole.push("MANAGER_AREA");
    }
    if (role === "executive") {
      userRole.push("SR_EXECUTIVE_AREA");
      userRole.push("EXECUTIVE_AREA");
    }
    //if no default query then pass {}
    let matchQuery = {
      companyId: companyId,
      isDeleted: false,
      userDepartment: "DISTRIBUTION_DEPARTMENT",
      userRole: { $in: userRole },
    };
    if (req.userData.userType === userEnum.user) {
      matchQuery["_id"] = req.userData.Id;
    }
    if (
      req.userData.userType !== userEnum.user &&
      req.query &&
      Object.keys(req.query).length
    ) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let dataExist = await userService.findAllWithQuery(matchQuery);

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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (req.userData.userType === userEnum.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `You do not have authority to access this.`
      );
    }
    if (!(await userService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "userId",
      _id
    );

    if (deleteRefCheck.status === true) {
      let deleted = await userService.getOneAndDelete({ _id });
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
    if (req.userData.userType === userEnum.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `You do not have authority to access this.`
      );
    }
    let dataExist = await userService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await userService.getOneAndUpdate(
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

/**
 *login
 */
exports.login = async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;

    let dataFound = await userService.getOneByMultiField({ email });
    if (!dataFound) {
      throw new ApiError(httpStatus.OK, `User not found.`);
    }

    let matched = await bcrypt.compare(password, dataFound.password);
    if (!matched) {
      throw new ApiError(httpStatus.OK, `Invalid Pasword!`);
    }
    let {
      _id: userId,
      userType,
      mobile,
      firstName,
      lastName,
      companyId,
    } = dataFound;

    let token = await tokenCreate(dataFound);
    if (!token) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    let refreshToken = await refreshTokenCreate(dataFound);
    if (!refreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }

    return res.status(httpStatus.OK).send({
      message: `Login successful!`,
      data: {
        token: token,
        refreshToken: refreshToken,
        userId: userId,
        fullName: `${firstName} ${lastName}`,
        email: email,
        mobile: mobile,
        userType: userType,
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

/**
 * verify otp
 */
exports.verifyOtp = async (req, res) => {
  try {
    let otp = req.body.otp;
    let { Id: userId, userType } = req.userData;

    let userExist = await userService.getOneByMultiField({
      _id: userId,
      userType,
    });
    if (!userExist) {
      throw new ApiError(httpStatus.OK, "User Not Found");
    }
    let { firstName, lastName, email, mobile } = userExist;

    let isOtpValid = await otpHelper.getOtpValidity(req.userData, otp);
    if (!isOtpValid.status) {
      throw new ApiError(httpStatus.OK, isOtpValid.message);
    }

    let token = await tokenCreate(userExist);
    if (!token) {
      throw new ApiError(httpStatus.OK, `Something went wrong`);
    }

    return res.status(httpStatus.OK).send({
      message: "Login Successfull.",
      status: true,
      data: {
        token: token,
        fullName: `${firstName} ${lastName}`,
        email: email,
        mobile: mobile,
      },
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
