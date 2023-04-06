const jwt = require('jsonwebtoken')
const config = require('../../../config/config')
const logger = require('../../../config/logger')
const authHelper = require('../helper/AuthHelper')
const httpStatus = require('http-status')
const ApiError = require('../../utils/ApiError')

exports.authCheckMiddleware = async (req, res, next) => {
  try {
    /**
     * check token exist in req body
     */
    let isTokenExist = authHelper.checkTokenExist(req, res)
    if (!isTokenExist || !isTokenExist.status) {
      return res.status(isTokenExist.statusCode).send({
        ...isTokenExist.data
      })
    }
    let token = isTokenExist.data
    const decoded = await jwt.verify(token, config.jwt_secret)
    req.userData = decoded

    if (!req.userData || !req.userData.Id || req.userData.Id === '') {
      throw new ApiError(401, `Invalid Token`)
    }
    if (req.userData.tokenType !== 'LOGIN') {
      throw new ApiError(401, `Invalid Token`)
    }

    if (
      req.userData.userType === 'SUPER_ADMIN' ||
      req.userData.userType === 'ADMIN'
    ) {
      let userDetails = await authHelper.checkAdminValid(req.userData)
      if (!userDetails.status) {
        throw new ApiError(401, userDetails.message)
      }
    }

    if (req.userData.userType === 'USER') {
      let userDetails = await authHelper.checkUserValid(req.userData)
      if (!userDetails.status) {
        throw new ApiError(401, userDetails.message)
      }
    }
    next()
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
    logger.info(error_msg)

    return res.status(401).send({
      message: error_msg,
      code: 'AUTHENTICATION_FAILED',
      issue: error_msg.toUpperCase().replace(/ /gi, '_'),
      data: null,
      status: false
    })
  }
}

exports.otpVerifyToken = async (req, res, next) => {
  try {
    let isTokenExist = authHelper.checkTokenExist(req, res)
    if (!isTokenExist || !isTokenExist.status) {
      return res.status(isTokenExist.statusCode).send({
        ...isTokenExist.data
      })
    }
    let token = isTokenExist.data
    const decoded = await jwt.verify(token, config.jwt_secret_otp)
    req.userData = decoded

    if (!req.userData || !req.userData.Id || req.userData.Id === '') {
      throw new ApiError(401, `Invalid Token`)
    }
    if (req.userData.tokenType !== 'OTP_VERIFY') {
      throw new ApiError(401, `Invalid Token`)
    }

    if (
      req.userData.userType === 'SUPER_ADMIN' ||
      req.userData.userType === 'ADMIN'
    ) {
      let userDetails = await authHelper.checkAdminValid(req.userData)
      if (!userDetails.status) {
        throw new ApiError(401, userDetails.message)
      }
    }

    if (req.userData.userType === 'USER') {
      let userDetails = await authHelper.checkUserValid(req.userData)
      if (!userDetails.status) {
        throw new ApiError(401, userDetails.message)
      }
    }
    next()
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
    logger.info(error_msg)

    return res.status(401).send({
      message: error_msg,
      code: 'AUTHENTICATION_FAILED',
      issue: error_msg.toUpperCase().replace(/ /gi, '_'),
      data: null,
      status: false
    })
  }
}

exports.userAuthCheckLogin = async function (req, res, next) {
  try {
    if (
      req.headers !== undefined &&
      req.headers['x-access-token'] !== undefined &&
      req.headers['x-access-token'] !== ''
    ) {
      const token = req.headers['x-access-token'].trim()

      let permission = []
      const decoded = await jwt.verify(token, process.env.JWT_KEY)
      req.userData = decoded

      let req_url = req.baseUrl + req.route.path

      let req_method = req.method.toUpperCase()
      if (req.userData.Id === undefined || req.userData.Id === '') {
        return res.status(401).send({
          message: 'Please login with registered email id.',
          status: false
        })
      } else {
        if (
          req.userData.token_type === undefined ||
          req.userData.token_type === '' ||
          req.userData.token_type !== 'LOGIN'
        ) {
          return res.status(401).send({
            message: 'Invalid token.',
            status: false
          })
        }
        const user = await User.findOne({
          _id: req.userData.Id
        })
        if (user) {
          if (!user.is_active) {
            return res.status(200).send({
              message: 'Your account is under review.',
              status: false
            })
          }
          // if (!req.userData.admin) {
          //     if (!AUTHORIZED_LIST[req.userData.type].includes(req.baseUrl)) {
          //         return res.status(401).send({
          //             message: "You do not have authority to access this action",
          //             status: false,
          //         });
          //     }
          // }

          // req.body.user_id = req.userData.Id.trim();
          next()
        } else {
          return res.status(401).send({
            message: 'Authentication Failed.',
            status: false
          })
        }
      }
    } else {
      return res.status(401).send({
        message: 'Authentication Failed. Please login with  register username.',
        status: false
      })
    }
  } catch (error) {
    return res.status(401).send({
      message: 'Authentication Failed.',
      status: false
    })
  }
}
//----------------------------------------------------------

exports.userAuthCheckOtpVerify = async function (req, res, next) {
  try {
    if (
      req.headers !== undefined &&
      req.headers['x-access-token'] !== undefined &&
      req.headers['x-access-token'] !== ''
    ) {
      const token = req.headers['x-access-token'].trim()
      let permission = []
      const decoded = await jwt.verify(token, process.env.JWT_KEY)
      req.userData = decoded

      let req_url = req.baseUrl + req.route.path
      let req_method = req.method.toUpperCase()

      if (req.userData.Id === undefined || req.userData.Id === '') {
        return res.status(401).send({
          message: 'Please login with registered email id.',
          status: false
        })
      } else {
        if (
          req.userData.token_type === undefined ||
          req.userData.token_type === '' ||
          req.userData.token_type !== 'OTP_VERIFY'
        ) {
          return res.status(401).send({
            message: 'Invalid token.',
            status: false
          })
        }
        const user = await User.findOne({
          _id: req.userData.Id
        })
        if (user) {
          if (!user.is_active) {
            return res.status(200).send({
              message: 'Your account is under review.',
              status: false
            })
          }
          // req.body.user_id = req.userData.Id.trim();
          next()
        } else {
          return res.status(401).send({
            message: 'Authentication Failed.',
            status: false
          })
        }
      }
    } else {
      return res.status(401).send({
        message: 'Authentication Failed. Please login with  register username.',
        status: false
      })
    }
  } catch (error) {
    return res.status(401).send({
      message: 'Authentication Failed.',
      status: false
    })
  }
}

//----------------------------------------------------------

exports.userAuthCheckResetPassword = async function (req, res, next) {
  try {
    if (
      req.headers !== undefined &&
      req.headers['x-access-token'] !== undefined &&
      req.headers['x-access-token'] !== ''
    ) {
      const token = req.headers['x-access-token'].trim()
      let permission = []
      const decoded = await jwt.verify(token, process.env.JWT_KEY)
      req.userData = decoded

      let req_url = req.baseUrl + req.route.path
      let req_method = req.method.toUpperCase()

      if (req.userData.Id === undefined || req.userData.Id === '') {
        return res.status(401).send({
          message: 'Please login with registered email id.',
          status: false
        })
      } else {
        if (
          req.userData.token_type === undefined ||
          req.userData.token_type === '' ||
          req.userData.token_type !== 'RESET_PASSWORD'
        ) {
          return res.status(401).send({
            message: 'Invalid token.',
            status: false
          })
        }
        const user = await User.findOne({
          _id: req.userData.Id
        })
        if (user) {
          if (!user.is_active) {
            return res.status(200).send({
              message: 'Your account is under review.',
              status: false
            })
          }
          // req.body.user_id = req.userData.Id.trim();
          next()
        } else {
          return res.status(401).send({
            message: 'Authentication Failed.',
            status: false
          })
        }
      }
    } else {
      return res.status(401).send({
        message: 'Authentication Failed. Please login with  register username.',
        status: false
      })
    }
  } catch (error) {
    return res.status(401).send({
      message: 'Authentication Failed.',
      status: false
    })
  }
}

//----------------------------------------------------------

exports.twoStepVerify = async function (req, res, next) {
  try {
    if (
      req.headers !== undefined &&
      req.headers['x-access-token'] !== undefined &&
      req.headers['x-access-token'] !== ''
    ) {
      const token = req.headers['x-access-token'].trim()
      let permission = []
      const decoded = await jwt.verify(token, process.env.JWT_KEY)
      req.userData = decoded

      let req_url = req.baseUrl + req.route.path
      let req_method = req.method.toUpperCase()

      if (req.userData.Id === undefined || req.userData.Id === '') {
        return res.status(401).send({
          message: 'Please login with registered email id.',
          status: false
        })
      } else {
        if (
          req.userData.token_type === undefined ||
          req.userData.token_type === '' ||
          req.userData.token_type !== 'OTP_VERIFY_LOGIN'
        ) {
          return res.status(401).send({
            message: 'Invalid token.',
            status: false
          })
        }
        const user = await User.findOne({
          _id: req.userData.Id
        })
        if (user) {
          if (!user.is_active) {
            return res.status(200).send({
              message: 'Your account is under review.',
              status: false
            })
          }
          // req.body.user_id = req.userData.Id.trim();
          next()
        } else {
          return res.status(401).send({
            message: 'Authentication Failed.',
            status: false
          })
        }
      }
    } else {
      return res.status(401).send({
        message: 'Authentication Failed. Please login with  register username.',
        status: false
      })
    }
  } catch (error) {
    return res.status(401).send({
      message: 'Authentication Failed.',
      status: false
    })
  }
}

//----------------------------------------------------------
exports.checkEditLogAccess = async function (req, res, next) {
  try {
    if (req.userData) {
      const user = await User.findOne({
        _id: req.userData.Id
      })
      if (!user) {
        return res.status(401).send({
          message: 'Authentication Failed.',
          status: false
        })
      }
      if (user.is_active === false) {
        return res.status(200).send({
          message: 'Your account is under review.',
          status: false
        })
      }
      if (user.canEditLogs === false && user.department !== 'STATION_MANAGER') {
        return res.status(200).send({
          message:
            'Permission denied. You do not have authority to change flight logs. Please contact administrator.',
          status: false
        })
      }
      next()
    }
  } catch (error) {
    return res.status(401).send({
      message: 'Authentication Failed.',
      status: false
    })
  }
}
//-

//--------------------------------------------------
exports.otpTokenCheck = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers['x-access-token']
  if (!token) {
    return res.status(401).send({
      message: 'Otp token required.',
      status: false
    })
  } else {
    try {
      const decoded = jwt.verify(token, config.JWT_KEY)
      req.userData = decoded
    } catch (err) {
      return res.status(401).send({
        message: 'Authentication failed.',
        status: false
      })
    }
  }
  return next()
}

//-----------create token for otp------------//
exports.otpToken = (user, req) => {
  let emailOTPToken = null
  let mobileOTPToken = null

  const email = req.body?.email || user.email
  const mobileNumber = req.body?.mobileNumber || user.mobileNumber
  const userName = user.firstName + user.lastName

  if (email) {
    emailOTPToken = jwt.sign(
      {
        Id: user._id,
        fullName: userName,
        userEmail: email,
        contactNumber: mobileNumber,
        token_type: 'EMAIL_OTP'
      },
      process.env.JWT_KEY,
      {
        expiresIn: '10m'
      }
    )
  }
  if (mobileNumber) {
    mobileOTPToken = jwt.sign(
      {
        Id: user._id,
        fullName: userName,
        userEmail: email,
        contactNumber: mobileNumber,
        token_type: 'MOBILE_OTP'
      },
      process.env.JWT_KEY,
      {
        expiresIn: '10m'
      }
    )
  }

  const otpToken = { emailOTPToken, mobileOTPToken }
  return otpToken
}

// AdminAuthCheck
exports.adminAuthCheck = async (req, res, next) => {
  try {
    if (
      req.headers !== undefined &&
      req.headers['x-access-token'] !== undefined &&
      req.headers['x-access-token'] !== ''
    ) {
      const token = req.headers['x-access-token'].trim()
      let permission = []
      const decoded = await jwt.verify(token, process.env.JWT_KEY)
      req.userData = decoded
      let req_url = req.baseUrl + req.route.path
      let req_method = req.method.toUpperCase()
      if (req.userData.Id === undefined || req.userData.Id === '') {
        return res.status(401).send({
          message: 'Please login with registered email id.',
          status: false
        })
      } else {
        // if (
        //   req.userData.token_type === undefined ||
        //   req.userData.token_type === "" ||
        //   req.userData.type !== "user"
        // ) {
        //
        //   return res.status(401).send({
        //     message: "Invalid token.",
        //     status: false,
        //   });
        // }
        var adminExist = await Admin.findById({
          _id: req.userData.Id
        })
        if (adminExist) {
          adminExist = JSON.parse(JSON.stringify(adminExist))
          if (!adminExist['isActive']) {
            return res.status(200).send({
              message: 'Your account is under review.',
              status: false
            })
          } else {
            // req.body.Admin_id = req.userData.Id.trim();
            next()
          }
        } else {
          return res.status(401).send({
            message: 'Authentication Failed.',
            status: false
          })
        }
      }
    } else {
      return res.status(401).send({
        message:
          'Authentication Failed. Please login with  register Adminname.',
        status: false
      })
    }
  } catch (error) {
    return res.status(401).send({
      message: 'Authentication Failed.',
      status: false
    })
  }
}

//--------------------------------------------------
// AdminAuthCheck;
exports.userAuthCheck = async (req, res, next) => {
  try {
    if (
      req.headers != undefined &&
      req.headers['x-access-token'] != undefined &&
      req.headers['x-access-token'] != ''
    ) {
      const token = req.headers['x-access-token'].trim()
      const decoded = jwt.verify(token, config.JWT_KEY)
      req.userData = decoded

      // return
      if (
        req.userData.Id === undefined ||
        req.userData.Id === '' ||
        req.userData.type !== 'user'
      ) {
        return res.status(401).send({
          msg: 'Please login with registered Adminname/phone number.',
          data: null,
          status: false
        })
      } else if (req.userData.tokenType !== 'mobileOTP') {
        return res.status(401).send({
          msg: 'Authentication failed. Invalid token.',
          data: null,
          status: false
        })
      } else {
        User.find({ _id: req.userData.Id })
          .exec()
          .then(result => {
            if (result.length === 0) {
              return res.status(401).send({
                msg: 'No Admin found with such id, Please register yourself first with valid Adminname/phone number.',
                data: null,
                status: false
              })
            } else {
              next()
            }
          })
          .catch(error => {
            return res.status(500).send({
              msg: error,
              data: null,
              status: false
            })
          })
      }
    } else {
      return res.status(401).send({
        msg: 'Please login with registered email id.',
        data: null,
        status: false
      })
    }
  } catch (error) {
    return res.status(401).send({
      msg: 'Authentication failed.',
      data: null,
      status: false
    })
  }
}
//--------------------------------------------------
