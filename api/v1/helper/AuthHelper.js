const adminService = require('../services/AdminService')
const userService = require('../services/UserService')
const logger = require('../../../config/logger')

const checkTokenExist = (req, res) => {
  if (
    !req.headers ||
    !req.headers['x-access-token'] ||
    req.headers['x-access-token'] === ''
  ) {
    return {
      data: {
        message: 'Authentication Failed. Please login.',
        code: 'TOKEN_NOT_FOUND.',
        issue: 'AUTHENTICATION_FAILED',
        data: null,
        status: false
      },
      statusCode: 401,
      status: false
    }
  } else {
    return {
      data: req.headers['x-access-token'].trim(),
      statusCode: 200,
      status: true
    }
  }
}

const checkAdminValid = async userData => {
  try {
    let { Id: userId, userType } = userData
    let userExist = await adminService.getOneByMultiField({
      _id: userId,
      userType: userType
    })
    if (!userExist) {
      return {
        message: 'user not found.',
        code: 'USER_NOT_FOUND.',
        issue: 'AUTHENTICATION_FAILED',
        data: null,
        status: false
      }
    } else if (!userExist.isActive) {
      return {
        message: 'your account is under review.',
        code: 'ACCOUNT_UNDER_REVIEW.',
        issue: 'AUTHENTICATION_FAILED',
        data: null,
        status: false
      }
    } else {
      return {
        message: 'All OK',
        data: userExist,
        code: null,
        issue: null,
        status: true
      }
    }
  } catch (err) {
    logger.info(errData.resData)
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
    return {
      message: error_msg,
      code: 'USER_NOT_FOUND.',
      issue: 'AUTHENTICATION_FAILED',
      data: null,
      status: false
    }
  }
}

const checkUserValid = async userData => {
  try {
    let { Id: userId, userType } = userData
    let userExist = await userService.getOneByMultiField({
      _id: userId,
      userType: userType
    })
    if (!userExist) {
      return {
        message: 'user not found.',
        code: 'USER_NOT_FOUND.',
        issue: 'AUTHENTICATION_FAILED',
        data: null,
        status: false
      }
    } else if (!userExist.isActive) {
      return {
        message: 'your account is under review.',
        code: 'ACCOUNT_UNDER_REVIEW.',
        issue: 'AUTHENTICATION_FAILED',
        data: null,
        status: false
      }
    } else {
      return {
        message: 'All OK',
        data: userExist,
        code: null,
        issue: null,
        status: true
      }
    }
  } catch (err) {
    logger.info(errData.resData)
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
    return {
      message: error_msg,
      code: 'USER_NOT_FOUND.',
      issue: 'AUTHENTICATION_FAILED',
      data: null,
      status: false
    }
  }
}

module.exports = {
  checkTokenExist,
  checkAdminValid,
  checkUserValid
}
