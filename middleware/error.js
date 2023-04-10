const mongoose = require('mongoose')
const httpStatus = require('http-status')
const config = require('../config/config')
const logger = require('../config/logger')
const ApiError = require('../api/utils/apiError')

const errorConverter = (err, req, res, next) => {
  let error = err
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR
    const message = error.message || httpStatus[statusCode]
    error = new ApiError(statusCode, message, false, err.stack)
  }
  next(error)
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR
    // message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    message = message
  }
  res.locals.errorMessage = err.message
  const response = {
    message,
    status: false,
    data: null,
    code: 'ERR',
    issue: 'SOME_ERROR'
    // ...(config.env === 'development' && { stack: err.stack })
  }
  if (config.env === 'development') {
    logger.error(err)
  }
  return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(response)
}

module.exports = {
  errorConverter,
  errorHandler
}
