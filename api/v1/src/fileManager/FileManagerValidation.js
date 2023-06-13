const Joi = require('joi')
Joi.joiDate = require('@joi/date')(Joi)
Joi.joiObjectId = require('joi-objectid')(Joi)
const httpStatus = require('http-status')
const ApiError = require('../../utils/apiErrorUtils')
const errorRes = require('../../utils/resError')
const { promises: Fs } = require('fs')
const path = require('path')
const commonValidation = require('../../helper/CommonValidation')
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const {
  documentMimeType,
  imageMimetype,
  videoMimetype,
  allMimetype
} = require('../middleware/validation')
const logger = require('../../../config/logger')

const fileExistCheck = async (req, res, next) => {
  try {
    req.body = JSON.parse(JSON.stringify(req.body))

    let mimeTypeToCheck
    let fileType = ''
    if (
      req.body.fileType !== undefined &&
      req.body.fileType !== '' &&
      req.body.fileType !== null
    ) {
      fileType = req.body.fileType.toUpperCase()
      if (fileType === 'IMAGE') {
        mimeTypeToCheck = imageMimetype
      } else if (fileType === 'VIDEO') {
        mimeTypeToCheck = videoMimetype
      } else if (fileType === 'DOCUMENT') {
        mimeTypeToCheck = documentMimeType
      }
    } else {
      throw new ApiError(httpStatus.OK, `File type is required.`)
    }
    if (
      req.files !== undefined &&
      req.files !== null &&
      Array.isArray(req.files) &&
      req.files.length
    ) {
      for (let file in req.files) {
        if (!mimeTypeToCheck.includes(req.files[file].mimetype)) {
          let unlinked = await Fs.unlink(req.files[file].path, () => {
            logger.info('unlinked file')
          })
          throw new ApiError(
            httpStatus.OK,
            `Something went wrong with file, fileType does not match with the type given.`
          )
        }
        req.body.fileUrl = req.files[file].path
        delete req.body.errorFiles
        next()
      }
    } else {
      next()
    }
  } catch (err) {
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message, status, data, code, issue } = errData.resData
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue })
  }
}

const create = {
  body: Joi.object().keys({
    fileType: Joi.string().required().valid('IMAGE', 'VIDEO', 'DOCUMENT'),
    fileUrl: Joi.string().required(),
    category: Joi.string().required()
  })
}

const getAllFilter = {
  body: Joi.object().keys({
    params: Joi.array().items(Joi.string().required()),
    searchValue: Joi.string().allow(''),
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(''),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(''),
        dateFilterKey: Joi.string().allow('').optional()
      })
      .default({}),
    rangeFilterBy: Joi.object()
      .keys({
        rangeFilterKey: Joi.string().allow(''),
        rangeInitial: Joi.string().allow(''),
        rangeEnd: Joi.string().allow('')
      })
      .default({})
      .optional(),
    orderBy: Joi.string().allow(''),
    orderByValue: Joi.number().valid(1, -1).allow(''),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    filterBy: Joi.array().items(
      Joi.object().keys({
        fieldName: Joi.string().allow(''),
        value: Joi.alternatives().try(
          Joi.string().allow(''),
          Joi.number().allow(''),
          Joi.boolean().allow(''),
          Joi.array().items(Joi.string()).default([]),
          Joi.array().items(Joi.number()).default([]),
          Joi.array().items(Joi.boolean()).default([]),
          Joi.array().default([])
        )
      })
    ),
    isPaginationRequired: Joi.boolean().default(true).optional()
  })
}

const get = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId)
  })
}

const update = {
  params: Joi.object().keys({
    id: Joi.required().custom(commonValidation.objectId)
  }),
  body: Joi.object().keys({
    fileType: Joi.string().required().valid('IMAGE', 'VIDEO', 'DOCUMENT'),
    fileUrl: Joi.string().required(),
    category: Joi.string().required()
  })
}

const deleteValidation = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId)
  })
}
const changeStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId)
  })
}

module.exports = {
  fileExistCheck,
  create,
  getAllFilter,
  get,
  update,
  deleteValidation,
  changeStatus
}
