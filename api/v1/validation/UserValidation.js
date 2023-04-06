const Joi = require('joi').extend(require('@joi/date'))
Joi.joiDate = require('@joi/date')(Joi)
Joi.joiObjectId = require('joi-objectid')(Joi)
const commonValidation = require('./CommonValidation')

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    firstName: Joi.string().lowercase(),
    lastName: Joi.string().lowercase().required(),
    mobile: Joi.string()
      .lowercase()
      .custom(commonValidation.indianMobile)
      .required(),
    email: Joi.string().lowercase().required()
  })
}

/**
 * update existing document
 */
const update = {
  body: Joi.object().keys({
    firstName: Joi.string().lowercase(),
    lastName: Joi.string().lowercase().required(),
    mobile: Joi.string()
      .lowercase()
      .custom(commonValidation.indianMobile)
      .required(),
    email: Joi.string().lowercase().required()
  })
}

/**
 * filter and pagination api
 */
const getAllFilter = {
  body: Joi.object().keys({
    params: Joi.array().items(Joi.string().required()),
    searchValue: Joi.string().allow(''),
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(''),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(''),
        dateFilterKey: Joi.string().allow('')
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

/**
 * get either all data or single document
 */
const get = {
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
      mobile: Joi.string().custom(commonValidation.indianMobile).optional(),
      email: Joi.string().optional()
    })
    .optional()
}

/**
 * delete a document
 */
const deleteDocument = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required()
  })
}

/**
 * change status of document
 */
const changeStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required()
  })
}

/**
 * login
 */
const loginValid = {
  body: Joi.object()
    .keys({
      mobile: Joi.string().custom(commonValidation.indianMobile).required()
    })
    .required()
}

/**
 * verify otp
 */
const verifyOtpValid = {
  body: Joi.object()
    .keys({
      otp: Joi.string().required()
    })
    .required()
}

/**
 * exports
 */
module.exports = {
  create,
  getAllFilter,
  get,
  update,
  deleteDocument,
  changeStatus,
  loginValid,
  verifyOtpValid
}
