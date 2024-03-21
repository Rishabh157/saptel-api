const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    orderNumber: Joi.string().required(),
    ic2: Joi.string().custom(commonValidation.objectId).required(),
    ic3: Joi.string().custom(commonValidation.objectId).required(),
    remark: Joi.string().required(),
  }),
};

// cc info update
const ccInfoUpdate = {
  body: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
    oldOrderNumber: Joi.string().allow(null),
    settledAmount: Joi.string().required(),
    ccRemark: Joi.string().required(),
  }),
};

// manager approval
const updateManager = {
  body: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
    level: Joi.string().valid("FIRST", "SECOND"),
    approve: Joi.boolean(),
    remark: Joi.string().required(),
    complaintNumber: Joi.number().required(),
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

//for dealer

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

// accounts approval
const accountApproval = {
  body: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
    dealerId: Joi.string().custom(commonValidation.objectId).required(),
    creditAmount: Joi.number().required(),
    accountRemark: Joi.string().required(),
    accountApproval: Joi.boolean(),
    complaintNumber: Joi.number().required(),
  }),
};

// dealer approval
const dealerApproval = {
  body: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
    dealerRemark: Joi.string().required(),
    returnItemBarcode: Joi.array().items(Joi.string()).allow(),
    oldOrderNumber: Joi.string().allow(null),
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
  create,
  getAllFilter,
  get,
  ccInfoUpdate,
  getById,
  updateManager,
  accountApproval,
  dealerApproval,
};
