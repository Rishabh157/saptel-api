const config = require('../../../config/config')
const logger = require('../../../config/logger')
const httpStatus = require('http-status')
const ApiError = require('../../utils/apiErrorUtils')
const { errorRes } = require('../../utils/resError')
const accessmoduleService = require('../../v1/services/AccessModuleService')

exports.accessModuleCheck = async (req, res, next) => {
  try {
    /**
     * check token exist in req body
     */
    let method = req.method
    let route = req.baseUrl + req.route.path
    if (
      !(await accessmoduleService.getOneByMultiField({
        route: route.toLowerCase(),
        method: method.toLowerCase()
      }))
    ) {
      throw new ApiError(
        httpStatus.OK,
        `Please add '${route}' route and method ${method} to the access module `
      )
    }

    next()
  } catch (err) {
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message, status, data, code, issue } = errData.resData
    return res.status(200).send({
      message,
      status,
      data,
      code: 'ACCESS_MODULE_MISSING',
      issue: 'ACCESS_MODULE_MISSING'
    })
  }
}
