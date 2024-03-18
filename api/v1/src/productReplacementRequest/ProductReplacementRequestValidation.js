const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

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
      orderNumber: Joi.string().optional(),
      complaintNumber: Joi.string().optional(),
    })
    .optional(),
};

const updateManager = {
  body: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
    level: Joi.string().valid("FIRST", "SECOND"),
    approve: Joi.boolean(),
    remark: Joi.string().required(),
  }),
};

// cc update details
const ccUpdateDetails = {
  body: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
    customerNumber: Joi.string(),
    alternateNumber: Joi.string().allow(""),
    replacedSchemeId: Joi.string().custom(commonValidation.objectId).required(),
    replacedSchemeLabel: Joi.string().required(),
    productGroupId: Joi.string().custom(commonValidation.objectId).required(),
    ccRemark: Joi.string().required(),
  }),
};

// accounts approval
const accountApproval = {
  body: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
    accountRemark: Joi.string().required(),
    accountApproval: Joi.boolean(),
    orderReferenceNumber: Joi.number().required(),
  }),
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
  getAllFilter,
  get,
  updateManager,
  getById,
  ccUpdateDetails,
  accountApproval,
};
