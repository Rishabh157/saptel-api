const otpService = require('../../services/OtpService')
const httpStatus = require('http-status')
const ApiError = require('../../../utils/ApiError')
const { generateOTP } = require('../../helper/OtpGenerateHelper')
const moment = require('moment')

exports.getOtp = async (userId, userType) => {
  try {
    let resToSend = {
      message: '',
      status: false,
      data: null
    }
    // let otp = await generateOTP()
    let otp = '123456'
    let otpReqBody = {
      userId: userId,
      userType: userType,
      otp: otp,
      expiryDateTime: moment()
        .utcOffset('+05:30')
        .add(20, 'minutes')
        .format('YYYY-MM-DD HH:mm:ss'),
      isUsed: false
    }
    let otpExist = await otpService.getOneByMultiField({
      userId: userId,
      userType: userType,
      isUsed: false
    })
    if (otpExist) {
      otpReqBody.otp = otpExist.otp
    }

    let otpDataCreated = await otpService.upsertData(
      { userId: userId, userType: userType },
      { ...otpReqBody }
    )
    if (!otpDataCreated) {
      throw new ApiError(httpStatus.OK, `Could not send otp varification. `)
    } else {
      return {
        message: `Ok`,
        status: true,
        data: otpDataCreated
      }
    }
  } catch (err) {
    let msg = []
    let i = 1
    let error_msg = 'Something went wrong. Please try again later. '
    let statusCode =
      err.statusCode !== undefined && err.statusCode !== null
        ? err.statusCode
        : 500
    if (!err.message) {
      for (let key in err.errors) {
        if (err.errors[key].message) {
          error_msg += i + '.' + err.errors[key].message
          i++
        }
      }
    } else {
      error_msg = err.message
    }
    return { message: error_msg, status: false, statusCode: statusCode }
  }
}

exports.getOtpValidity = async (userData, otp) => {
  try {
    let { Id: userId, userType } = userData
    let current_time = moment()
      .utcOffset('+05:30')
      .format('YYYY-MM-DD HH:mm:ss')

    let otpExist = await otpService.getOneByMultiField({
      otp: otp,
      userId: userId,
      userType: userType,
      isUsed: false,
      isDeleted: false
    })
    if (!otpExist) {
      throw new ApiError(
        httpStatus.OK,
        `Invalid otp. Please enter a valid otp.`
      )
    }

    let validityStart = moment(otpExist.updatedAt)
      .utcOffset('+05:30')
      .format('YYYY-MM-DD HH:mm:ss')

    if (
      moment(current_time).isBetween(validityStart, otpExist.expiryDateTime) ===
      false
    ) {
      throw new ApiError(httpStatus.OK, `Otp expired. Please try again.`)
    }

    let otpUsed = await otpService.getOneAndUpdate(
      {
        otp: otp,
        userId: userId,
        userType: userType,
        isUsed: false
      },
      { isUsed: true }
    )
    if (!otpUsed) {
      throw new ApiError(
        httpStatus.OK,
        `Something went wrong with the otp. Please try again`
      )
    } else {
      return {
        message: 'OTP FOUND AND UPDATED',
        status: true,
        statusCode: 200
      }
    }
  } catch (err) {
    let msg = []
    let i = 1
    let error_msg = ''
    let statusCode =
      err.statusCode !== undefined && err.statusCode !== null
        ? err.statusCode
        : 500
    if (!err.message) {
      for (let key in err.errors) {
        if (err.errors[key].message) {
          error_msg += i + '.' + err.errors[key].message
          i++
        }
      }
    } else {
      error_msg = err.message
    }
    return { message: error_msg, status: false, statusCode: statusCode }
  }
}
