const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const adminService = require("../../services/AdminService");
const bcryptjs = require("bcryptjs");
const otpHelper = require("../otp/OtpHelper");
const { sendMsg91Function } = require("../../helper/msgHelper");
const {
  tokenCreate,
  otpTokenCreate,
  refreshTokenCreate,
} = require("../../helper/tokenCreate");
const { isAfter } = require("date-fns");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const { errorRes } = require("../../../utils/resError");
const { userEnum } = require("../../helper/enumUtils");
const bcrypt = require("bcrypt");
const redisClient = require("../../../../database/redis");
const jwt = require("jsonwebtoken");
const { logOut } = require("../../helper/utils");
/*********************************************************************/

/**
 * add new admin user
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.add = async (req, res) => {
  try {
    let { userName, email, mobile, firstName, lastName, password } = req.body;

    /**
     * if only super admin can create new admin users.
     */
    // if (req.userData.userType !== userEnum.superAdmin) {
    //   throw new ApiError(
    //     httpStatus.OK,
    //     `You do not have authority to add users'`
    //   )
    // }

    /**
     * check duplicate exist
     */
    let dataExist = await adminService.isExists([
      { userName },
      { email },
      { mobile },
    ]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    /**
     * generate hashed password
     */

    let hashedPassword = await bcryptjs.hash(password, 12);
    if (!hashedPassword) {
      throw new ApiError(
        httpStatus.OK,
        `Something went wrong with the password.`
      );
    }
    req.body.password = hashedPassword;

    /**
     * create new data if all right
     */
    let dataCreated = await adminService.createNewData({ ...req.body });

    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: "Registered Successfully.",
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
/*********************************************************************/

exports.logout = async (req, res) => {
  logOut(req);
  return res.status(httpStatus.OK).send({
    message: `Logout successfull!`,
    data: [],
    status: true,
    code: null,
    issue: null,
  });
};

exports.changePassword = async (req, res) => {
  try {
    const deviceId = req.headers["device-id"];
    const token = req.headers["x-access-token"];
    const { currentPassword, newPassword, userId } = req.body;
    const decoded = await jwt.verify(token, config.jwt_secret);
    if (decoded.Id !== userId) {
      throw new ApiError(httpStatus.OK, `Invalid Token`);
    }
    const user = await adminService.getOneByMultiField({
      _id: userId,
      isDeleted: false,
    }); // assuming you're using Passport.js or similar for authentication
    let { _id, userType, firstName, mobile, lastName, email, userName } = user;
    // Check if the current password matches the user's password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ApiError(httpStatus.OK, `Current password not matched`);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();
    await logOut(req, true);
    let newToken = await tokenCreate(user);
    if (!newToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    let newRefreshToken = await refreshTokenCreate(user);

    if (!newRefreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    await redisClient.set(
      userId + deviceId,
      newToken + "***" + newRefreshToken
    );
    const allRedisValue = await redisClient.keys(`${userId}*`);
    return res.status(httpStatus.OK).send({
      message: `Password change successful!`,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        fullName: `${firstName} ${lastName}`,
        email: email,
        mobile: mobile,
        userName: userName,
      },
      status: true,
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

/**
 * login
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.login = async (req, res) => {
  try {
    let userName = req.body.userName;
    let password = req.body.password;
    let deviceId = req.headers["device-id"];

    let dataFound = await adminService.getOneByMultiField({ userName });
    if (!dataFound) {
      throw new ApiError(httpStatus.OK, `Admin not found.`);
    }
    let matched = await bcrypt.compare(password, dataFound.password);
    if (!matched) {
      throw new ApiError(httpStatus.OK, `Invalid Pasword!`);
    }
    console.log(dataFound);
    let {
      _id: userId,
      userType,
      firstName,
      mobile,
      lastName,
      email,
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

    await redisClient.set(userId + deviceId, token + "***" + refreshToken);

    return res.status(httpStatus.OK).send({
      message: `Login successful!`,
      data: {
        token: token,
        refreshToken: refreshToken,
        userId: userId,
        fullName: `${firstName} ${lastName}`,
        email: email,
        mobile: mobile,
        userName: userName,
        userType: userType,
        companyId: companyId,
      },
      status: true,
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
/*********************************************************************/
exports.refreshToken = async (req, res) => {
  try {
    let refreshTokenValue = req.body.refreshToken;
    let deviceId = req.headers["device-id"];

    const decoded = await jwt.verify(
      refreshTokenValue,
      config.jwt_secret_refresh
    );
    if (!decoded) {
      throw new ApiError(httpStatus.OK, `Invalid refreshToken`);
    }

    let userData = await adminService.getOneByMultiField({
      _id: decoded.Id,
      isDeleted: false,
    });
    if (!userData) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid token User not found."
      );
    }

    let newToken = await tokenCreate(userData);
    if (!newToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    let newRefreshToken = await refreshTokenCreate(userData);

    if (!newRefreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }

    await redisClient.set(
      decoded.Id + deviceId,
      newToken + "***" + newRefreshToken
    );

    return res.status(httpStatus.OK).send({
      message: `successfull!`,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
      status: true,
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
/**
 * verify otp function
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.verifyOtp = async (req, res) => {
  try {
    let otp = req.body.otp;
    let { Id: userId, userType } = req.userData;

    let userExist = await adminService.getOneByMultiField({
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
/*********************************************************************/

/**
 * update
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.update = async (req, res) => {
  try {
    let { firstName, lastName, mobile, email, companyId, userName } = req.body;
    let { Id: loggedInUserId, userType } = req.userData;
    if (userType === userEnum.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "AUTHORIZATION_FAILED");
    }
    let idToBeSearch = req.params.id;
    // userType === userEnum.admin
    //   ? loggedInUserId
    //   : req.params && req.params.id && userType === userEnum.superAdmin
    //   ? req.params.id
    //   : loggedInUserId;

    if (!idToBeSearch) {
      throw new ApiError(
        httpStatus.OK,
        "Invalid request, Unable to find user's unique id in the request."
      );
    }

    /**
     * check duplicate exist
     */
    let dataExist = await adminService.isExists(
      [{ userName }, { email }, { mobile }],
      idToBeSearch
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    //------------------Find data-------------------
    let datafound = await adminService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `User not found.`);
    }

    let dataUpdated = await adminService.getOneAndUpdate(
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
/*********************************************************************/

exports.updateCompany = async (req, res) => {
  try {
    let { companyId } = req.body;
    let { Id: loggedInUserId, userType } = req.userData;
    if (userType === userEnum.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "AUTHORIZATION_FAILED");
    }
    let idToBeSearch = req.params.id;
    // userType === userEnum.admin
    //   ? loggedInUserId
    //   : req.params && req.params.id && userType === userEnum.superAdmin
    //   ? req.params.id
    //   : loggedInUserId;

    if (!idToBeSearch) {
      throw new ApiError(
        httpStatus.OK,
        "Invalid request, Unable to find user's unique id in the request."
      );
    }

    /**
     * check duplicate exist
     */

    //------------------Find data-------------------
    let datafound = await adminService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `User not found.`);
    }

    let dataUpdated = await adminService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          companyId: companyId,
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
/**
 * all filter pagination api
 * @param {*} req
 * @param {*} res
 * @returns
 */
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
      throw new ApiError(httpStatus.UNAUTHORIZED, "AUTHORIZATION_FAILED");
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
    let additionalQuery = [];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await adminService.aggregateQuery(finalAggregateQuery);
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

    let result = await adminService.aggregateQuery(finalAggregateQuery);
    if (result.length) {
      return res.status(httpStatus.OK).send({
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
/*********************************************************************/

/**
 * view admin's profile
 * @param {*} req
 * @param {*} res
 * @returns
 */

exports.view = async (req, res) => {
  try {
    let { Id: loggedInUserId, userType } = req.userData;
    if (userType === userEnum.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "AUTHORIZATION_FAILED");
    }
    let userId =
      userType === userEnum.admin
        ? loggedInUserId
        : req.params && req.params.id && userType === userEnum.superAdmin
        ? req.params.id
        : loggedInUserId;

    if (!userId) {
      throw new ApiError(
        httpStatus.OK,
        "Invalid request, Unable to find user's unique id in the request."
      );
    }

    let dataExist = await adminService.getOneByMultiField(
      { _id: userId },
      { firstName: 1, lastName: 1, email: 1, mobile: 1, userName: 1 }
    );

    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "User not found.");
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
/*********************************************************************/

/**
 * get api if queryy then get individual otherwise get all
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.get = async (req, res) => {
  try {
    //if no default query then pass {}
    let { Id: loggedInUserId, userType } = req.userData;
    if (userType === userEnum.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "AUTHORIZATION_FAILED");
    }

    let matchQuery = { isDeleted: false };
    if (req.userData.userType === userEnum.admin) {
      matchQuery["_id"] = loggedInUserId;
    }
    if (
      req.userData.userType !== userEnum.admin &&
      req.query &&
      Object.keys(req.query).length
    ) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let dataExist = await adminService.findAllWithQuery(matchQuery);

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
/*********************************************************************/

/**
 * delete
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (
      req.userData.userType === userEnum.user ||
      req.userData.userType === userEnum.admin
    ) {
      throw new ApiError(httpStatus.UNAUTHORIZED, `AUTHORIZATION_FAILED`);
    }
    if (!(await adminService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await adminService.getOneAndDelete({ _id });
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
/*********************************************************************/

/**
 * status change
 * @param {*} req
 * @param {*} res
 * @returns
 */

exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    if (
      req.userData.userType === userEnum.user ||
      req.userData.userType === userEnum.admin
    ) {
      throw new ApiError(httpStatus.UNAUTHORIZED, `AUTHORIZATION_FAILED`);
    }
    let dataExist = await adminService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await adminService.getOneAndUpdate(
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
/*********************************************************************/
