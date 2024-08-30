const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    order_id: Joi.string().custom(commonValidation.objectId).allow(null),
    companyCode: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().max(10).min(10).required("Number should be 10 digit"),
    email: Joi.string().lowercase().allow(""),
    address: Joi.string().allow(""),
    address1: Joi.string().allow(""),
    landmark: Joi.string().allow(""),
    city: Joi.string().allow(""),
    state: Joi.string().allow(""),
    country: Joi.string().allow(""),
    zip_code: Joi.string().allow(""),
    quantity: Joi.string().allow(""),
    remark: Joi.string().allow(""),
    sdate: Joi.string().allow(""),
    idtag: Joi.string().allow(""),
    product_name: Joi.string().required(),
    paymentMode: Joi.string().allow(""),
    paymentStatus: Joi.string().allow(""),
    paymeny_mode: Joi.string().allow(""),
    leadType: Joi.string().required(),
    url: Joi.string().allow(""),
    price: Joi.string().allow(""),
    leadStatus: Joi.string().allow(""),
    transactionId: Joi.string().allow(""),
    paymentGatewayName: Joi.string().allow(""),
    leadStatus: Joi.string().required(),
    webLeadApiKey: Joi.string().required(),
  }),
};

/**
 * update existing document
 */
const update = {
  params: Joi.object().keys({
    id: Joi.required().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    pageUrl: Joi.string().required(),
    pageName: Joi.string().required(),
    headerSpace: Joi.string().allow(""),
    footerSpace: Joi.string().allow(""),
    websiteId: Joi.string().custom(commonValidation.objectId).required(),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

// check payment status cc avenue
const checkPaymentCCavenue = {
  params: Joi.object().keys({
    transactionId: Joi.string().required,
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
    isPrepaid: Joi.boolean().default(true),
  }),
};

/**
 * get either all data or single document
 */
const get = {
  params: Joi.object().keys({
    companyid: Joi.string().custom(commonValidation.objectId),
  }),
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
      pageUrl: Joi.string().optional(),
      pageName: Joi.string().optional(),
    })
    .optional(),
};

/**
 * delete a document
 */
const deleteDocument = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};

// get by id
const getById = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};

/**
 * change status of document
 */
const changeStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};
module.exports = {
  create,
  getAllFilter,
  get,
  update,
  deleteDocument,
  changeStatus,
  getById,
  checkPaymentCCavenue,
};
