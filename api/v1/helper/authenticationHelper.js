const adminService = require("../src/admin/AdminService");
const userService = require("../src/user/UserService");
const logger = require("../../../config/logger");
const { errorRes } = require("../../utils/resError");
const httpStatus = require("http-status");
const redisClient = require("../../../database/redis");

const checkTokenExist = (req, res) => {
  if (
    !req.headers ||
    !req.headers["x-access-token"] ||
    req.headers["x-access-token"] === ""
  ) {
    return {
      data: {
        message: "Authentication Failed. Please login.",
        code: "TOKEN_NOT_FOUND.",
        issue: "AUTHENTICATION_FAILED",
        data: null,
        status: false,
      },
      statusCode: httpStatus.UNAUTHORIZED,
      status: false,
    };
  } else {
    return {
      data: req.headers["x-access-token"].trim(),
      statusCode: httpStatus.OK,
      status: true,
    };
  }
};

const redisCheck = async (decoded, deviceId, token) => {
  try {
    const redisValue = await redisClient.get(decoded.Id + deviceId);
    if (!redisValue) {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }
    const redisAccessToken = redisValue.split("***");
    if (token !== redisAccessToken[0]) {
      throw new ApiError(httpStatus.ok, "Invalid Token");
    }
    return {
      message: "Ok",
      data: redisAccessToken,
      status: true,
    };
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message } = errData.resData;
    return {
      message: message,
      code: "AUTHENTICATION_FAILED",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    };
  }
};

const checkDeviceId = (req, res) => {
  if (
    req.route.path !== "/logout" &&
    (!req.headers ||
      !req.headers["device-id"] ||
      req.headers["device-id"] === "")
  ) {
    return {
      data: {
        message: "Invalid Device ID",
        code: "DEVICE_ID_NOT_FOUND.",
        issue: "INVALID_DEVICE_ID",
        data: null,
        status: false,
      },
      statusCode: httpStatus.UNAUTHORIZED,
      status: false,
    };
  } else {
    return {
      deviceId: req.headers["device-id"] ? req.headers["device-id"].trim() : "",
      statusCode: httpStatus.OK,
      status: true,
    };
  }
};

const checkAdminValid = async (userData) => {
  try {
    let { Id: userId, userType } = userData;
    let userExist = await adminService.getOneByMultiField({
      _id: userId,
      userType: userType,
    });
    if (!userExist) {
      return {
        message: "user not found.",
        code: "USER_NOT_FOUND.",
        issue: "AUTHENTICATION_FAILED",
        data: null,
        status: false,
      };
    } else if (!userExist.isActive) {
      return {
        message: "your account is under review.",
        code: "ACCOUNT_UNDER_REVIEW.",
        issue: "AUTHENTICATION_FAILED",
        data: null,
        status: false,
      };
    } else {
      return {
        message: "All OK",
        data: userExist,
        code: "OK",
        issue: null,
        status: true,
      };
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return {
      message,
      status,
      data,
      code: "USER_NOT_FOUND.",
      issue: "AUTHENTICATION_FAILED",
    };
  }
};

const checkUserValid = async (userData) => {
  try {
    let { Id: userId, userType } = userData;
    let userExist = await userService.getOneByMultiField({
      _id: userId,
      userType: userType,
    });
    if (!userExist) {
      return {
        message: "user not found.",
        code: "USER_NOT_FOUND.",
        issue: "AUTHENTICATION_FAILED",
        data: null,
        status: false,
      };
    } else if (!userExist.isActive) {
      return {
        message: "your account is under review.",
        code: "ACCOUNT_UNDER_REVIEW.",
        issue: "AUTHENTICATION_FAILED",
        data: null,
        status: false,
      };
    } else {
      return {
        message: "All OK",
        data: userExist,
        code: "OK",
        issue: null,
        status: true,
      };
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return {
      message,
      status,
      data,
      code: "USER_NOT_FOUND.",
      issue: "AUTHENTICATION_FAILED",
    };
  }
};

module.exports = {
  checkTokenExist,
  checkAdminValid,
  checkUserValid,
  redisCheck,
  checkDeviceId,
};
