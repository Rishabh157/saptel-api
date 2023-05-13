const jwt = require("jsonwebtoken");
const config = require("../../../config/config");
const logger = require("../../../config/logger");
const { tokenEnum } = require("../helper/enumUtils");

/**
 *
 * @param {Object} tokenData
 * @returns
 */
exports.tokenCreate = async (tokenData) => {
  var token = await jwt.sign(
    {
      Id: tokenData._id,
      userName: tokenData.userName,
      firstName: tokenData.firstName,
      lastName: tokenData.lastName,
      email: tokenData.email,
      mobile: tokenData.mobile,
      userType: tokenData.userType,
      tokenType: tokenEnum.login,
    },
    config.jwt_secret,
    {
      expiresIn: config.jwt_expires,
    }
  );
  return token;
};
exports.refreshTokenCreate = async (tokenData) => {
  var token = await jwt.sign(
    {
      Id: tokenData._id,
      userName: tokenData.userName,
      firstName: tokenData.firstName,
      lastName: tokenData.lastName,
      email: tokenData.email,
      mobile: tokenData.mobile,
      userType: tokenData.userType,
      tokenType: tokenEnum.login,
    },
    config.jwt_secret_refresh,
    {
      expiresIn: "1y",
    }
  );
  return token;
};
exports.dealerTokenCreate = async (tokenData) => {
  var token = await jwt.sign(
    {
      Id: tokenData._id,
      dealerCode: tokenData.dealerCode,
      firstName: tokenData.firstName,
      lastName: tokenData.lastName,
      email: tokenData.email,

      tokenType: tokenEnum.login,
    },
    config.jwt_dealer_secret,
    {
      expiresIn: config.jwt_expires,
    }
  );
  return token;
};
exports.dealerRefreshTokenCreate = async (tokenData) => {
  var token = await jwt.sign(
    {
      Id: tokenData._id,
      dealerCode: tokenData.dealerCode,
      firstName: tokenData.firstName,
      lastName: tokenData.lastName,
      email: tokenData.email,
      tokenType: tokenEnum.login,
    },
    config.jwt_dealer_secret_refresh,
    {
      expiresIn: "1y",
    }
  );
  return token;
};
/**
 *
 * @param {object} tokenData
 * @returns
 */
exports.otpTokenCreate = async (tokenData) => {
  var token = await jwt.sign(
    {
      Id: tokenData._id,
      userName: tokenData.userName,
      firstName: tokenData.firstName,
      lastName: tokenData.lastName,
      email: tokenData.email,
      mobile: tokenData.mobile,
      userType: tokenData.userType,
      tokenType: tokenEnum.otpverify,
    },
    config.jwt_secret_otp,
    {
      expiresIn: config.jwt_expires_otp,
    }
  );
  return token;
};
