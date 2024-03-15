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
    complaintNumber: Joi.string().required(),
    schemeId: Joi.required().custom(commonValidation.objectId),
    dealerId: Joi.required().custom(commonValidation.objectId).allow(null),
    wareHouseId: Joi.required().custom(commonValidation.objectId).allow(null),
    dateOfDelivery: Joi.string().allow(""),
    requestResolveDate: Joi.string().allow(""),
    settledAmount: Joi.string().allow(""),
    amountInWords: Joi.string().allow(""),
    customerName: Joi.string().required(),
    address: Joi.string().required(),
    stateId: Joi.required().custom(commonValidation.objectId),
    districtId: Joi.required().custom(commonValidation.objectId),
    tehsilId: Joi.required().custom(commonValidation.objectId),
    pincode: Joi.string().required(),
    customerNumber: Joi.string().required(),
    alternateNumber: Joi.string().allow(""),
    bankName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    ifscCode: Joi.string().required(),
    ccRemark: Joi.string().lowercase().allow(""),
    ccApproval: Joi.boolean(),
    ccApprovalDate: Joi.string().allow(""),
    accountRemark: Joi.string().lowercase().allow(""),
    accountApproval: Joi.boolean(),
    accountApprovalDate: Joi.boolean().allow(""),
    managerFirstRemark: Joi.string().lowercase().allow(""),
    managerFirstApproval: Joi.boolean(),
    managerFirstApprovalDate: Joi.boolean().allow(""),
    managerSecondRemark: Joi.string().lowercase().allow(""),
    managerSecondApproval: Joi.boolean(),
    managerSecondApprovalDate: Joi.boolean().allow(""),
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
      orderNumber: Joi.string().optional(),
      complaintNumber: Joi.string().optional(),
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

const updateManager = {
  body: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
    level: Joi.string().valid("FIRST", "SECOND"),
    approve: Joi.boolean(),
    remark: Joi.string(),
  }),
};

// cc update details
const ccUpdateDetails = {
  body: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
    customerNumber: Joi.string(),
    alternateNumber: Joi.string().allow(""),
    bankName: Joi.string(),
    accountNumber: Joi.string(),
    ifscCode: Joi.string(),
    ccRemark: Joi.string(),
  }),
};

// accounts approval
const accountApproval = {
  body: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
    accountRemark: Joi.string(),
    accountApproval: Joi.boolean(),
    settledAmount: Joi.string(),
    amountInWords: Joi.string(),
  }),
};

module.exports = {
  create,
  getAllFilter,
  get,
  getById,
  updateManager,
  ccUpdateDetails,
  accountApproval,
};
