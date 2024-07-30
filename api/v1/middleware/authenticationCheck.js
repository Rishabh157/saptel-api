const jwt = require("jsonwebtoken");
const config = require("../../../config/config");
const logger = require("../../../config/logger");
const authHelper = require("../helper/authenticationHelper");
const httpStatus = require("http-status");
const ApiError = require("../../utils/apiErrorUtils");
const { userEnum } = require("../helper/enumUtils");
const { errorRes } = require("../../utils/resError");

exports.authCheckMiddleware = async (req, res, next) => {
  try {
    /**
     * check token exist in req body
     */

    let isTokenExist = authHelper.checkTokenExist(req, res);

    if (!isTokenExist || !isTokenExist.status) {
      return res.status(isTokenExist.statusCode).send({
        ...isTokenExist.data,
      });
    }
    let token = isTokenExist.data;
    const decoded = jwt.verify(token, config.jwt_secret);

    req.userData = decoded;
    if (!req.userData || !req.userData.Id || req.userData.Id === "") {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }
    if (req.userData.tokenType !== "LOGIN") {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }

    const deviceIdCheck = authHelper.checkDeviceId(req, res);

    if (!deviceIdCheck.status) {
      throw new ApiError(httpStatus.UNAUTHORIZED, deviceIdCheck.message);
    }
    if (deviceIdCheck.deviceId !== "") {
      const redisResponse = await authHelper.redisCheck(
        decoded,
        deviceIdCheck.deviceId,
        token
      );

      if (!redisResponse.status) {
        throw new ApiError(httpStatus.UNAUTHORIZED, redisResponse.message);
      }
    }
    // if (
    //   req.userData.userType === userEnum.superAdmin ||
    //   req.userData.userType === userEnum.admin
    // ) {
    //   let userDetails = await authHelper.checkAdminValid(req.userData);
    //   if (!userDetails.status) {
    //     throw new ApiError(httpStatus.UNAUTHORIZED, userDetails.message);
    //   }
    // }

    if (req.userData.userType === userEnum.user) {
      let userDetails = await authHelper.checkUserValid(req.userData);

      if (!userDetails.status) {
        throw new ApiError(httpStatus.UNAUTHORIZED, userDetails.message);
      }
    }

    next();
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: message,
      code: "AUTHENTICATION_FAILED",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    });
  }
};

exports.authCheckDealerMiddleware = async (req, res, next) => {
  try {
    /**
     * check token exist in req body
     */

    let isTokenExist = authHelper.checkTokenExist(req, res);

    if (!isTokenExist || !isTokenExist.status) {
      return res.status(isTokenExist.statusCode).send({
        ...isTokenExist.data,
      });
    }

    let token = isTokenExist.data;

    const decoded = jwt.verify(token, config.jwt_dealer_secret);

    req.userData = decoded;
    if (!req.userData || !req.userData.Id || req.userData.Id === "") {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }

    if (req.userData.tokenType !== "LOGIN") {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }

    // if (req.userData.userType === userEnum.user) {
    //   let userDetails = await authHelper.checkUserValid(req.userData);
    //   if (!userDetails.status) {
    //     throw new ApiError(httpStatus.UNAUTHORIZED, userDetails.message);
    //   }
    // }

    next();
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: message,
      code: "AUTHENTICATION_FAILED",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    });
  }
};

exports.authCheckDeliveryBoyMiddleware = async (req, res, next) => {
  try {
    /**
     * check token exist in req body
     */

    let isTokenExist = authHelper.checkTokenExist(req, res);

    if (!isTokenExist || !isTokenExist.status) {
      return res.status(isTokenExist.statusCode).send({
        ...isTokenExist.data,
      });
    }

    let token = isTokenExist.data;

    const decoded = jwt.verify(token, config.jwt_delivery_boy_secret);

    req.userData = decoded;
    if (!req.userData || !req.userData.Id || req.userData.Id === "") {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }

    // if (req.userData.tokenType !== "LOGIN") {
    //   throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    // }

    // if (req.userData.userType === userEnum.user) {
    //   let userDetails = await authHelper.checkUserValid(req.userData);
    //   if (!userDetails.status) {
    //     throw new ApiError(httpStatus.UNAUTHORIZED, userDetails.message);
    //   }
    // }

    next();
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: message,
      code: "AUTHENTICATION_FAILED",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    });
  }
};

exports.getDealerData = async (token) => {
  const decoded = jwt.verify(token, config.jwt_dealer_secret);
  return decoded;
};

exports.otpVerifyToken = async (req, res, next) => {
  try {
    let isTokenExist = authHelper.checkTokenExist(req, res);
    if (!isTokenExist || !isTokenExist.status) {
      return res.status(isTokenExist.statusCode).send({
        ...isTokenExist.data,
      });
    }
    let token = isTokenExist.data;
    const decoded = await jwt.verify(token, config.jwt_secret_otp);
    req.userData = decoded;

    if (!req.userData || !req.userData.Id || req.userData.Id === "") {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }
    if (req.userData.tokenType !== "OTP_VERIFY") {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid Token`);
    }

    if (
      req.userData.userType === userEnum.superAdmin ||
      req.userData.userType === userEnum.admin
    ) {
      let userDetails = await authHelper.checkAdminValid(req.userData);
      if (!userDetails.status) {
        throw new ApiError(httpStatus.UNAUTHORIZED, userDetails.message);
      }
    }

    if (req.userData.userType === userEnum.user) {
      let userDetails = await authHelper.checkUserValid(req.userData);
      if (!userDetails.status) {
        throw new ApiError(httpStatus.UNAUTHORIZED, userDetails.message);
      }
    }
    next();
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: message,
      code: "AUTHENTICATION_FAILED",
      issue: message.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    });
  }
};
