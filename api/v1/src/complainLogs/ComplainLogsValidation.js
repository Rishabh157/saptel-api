const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    complaintNumber: Joi.number().required(),
    orderNumber: Joi.number().required(),
    orderId: Joi.string().custom(commonValidation.objectId).required(),
    schemeId: Joi.string().custom(commonValidation.objectId).required(),
    schemeName: Joi.string().required(),
    schemeCode: Joi.string().required(),
    orderStatus: Joi.string().required(),
    courierStatus: Joi.string().required(),
    callType: Joi.string().required(),
    status: Joi.string().required(),
    icOne: Joi.string().custom(commonValidation.objectId).required(),
    icTwo: Joi.string().custom(commonValidation.objectId).required(),
    icThree: Joi.string().custom(commonValidation.objectId).required(),
    remark: Joi.string().lowercase().required(),
  }),
};

/**
 * filter and pagination api
 */
const getAllFilter = {
  body: Joi.object().keys({
    params: Joi.array().items(Joi.string().required()),
    searchValue: Joi.string().allow(""),
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
    rangeFilterBy: Joi.object()
      .keys({
        rangeFilterKey: Joi.string().allow(""),
        rangeInitial: Joi.string().allow(""),
        rangeEnd: Joi.string().allow(""),
      })
      .default({})
      .optional(),
    orderBy: Joi.string().allow(""),
    orderByValue: Joi.number().valid(1, -1).allow(""),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    filterBy: Joi.array().items(
      Joi.object().keys({
        fieldName: Joi.string().allow(""),
        value: Joi.alternatives().try(
          Joi.string().allow(""),
          Joi.number().allow(""),
          Joi.boolean().allow(""),
          Joi.array().items(Joi.string()).default([]),
          Joi.array().items(Joi.number()).default([]),
          Joi.array().items(Joi.boolean()).default([]),
          Joi.array().default([])
        ),
      })
    ),
    isPaginationRequired: Joi.boolean().default(true).optional(),
  }),
};

/**
 * get either all data or single document
 */
const get = {
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
    })
    .optional(),
};

// complaint logs

const getLogs = {
  params: Joi.object()
    .keys({
      complaintId: Joi.string().custom(commonValidation.objectId),
    })
    .optional(),
};

/**
 * get by id
 */
const getById = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};

module.exports = {
  create,
  getAllFilter,
  get,
  getById,
  getLogs,
};
