const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    productGroupId: Joi.string().custom(commonValidation.objectId).required(),
    barcodeGroupNumber: Joi.string().required(),
    outerBoxbarCodeNumber: Joi.string().required(),
    cartonBoxId: Joi.string().custom(commonValidation.objectId).allow(null),
    invoiceNumber: Joi.string().required(),
    quantity: Joi.number().required(),
    lotNumber: Joi.string().required(),
    isUsed: Joi.boolean(),
    wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
    dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
    status: Joi.string().allow(""),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
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
    productGroupId: Joi.string().custom(commonValidation.objectId).required(),
    barcodeGroupNumber: Joi.string().required(),
    outerBoxbarCodeNumber: Joi.string().required(),

    lotNumber: Joi.string().required(),
    isUsed: Joi.boolean(),
    wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
    dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
    status: Joi.string().required(),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
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
  params: Joi.object().keys({
    companyid: Joi.string().custom(commonValidation.objectId),
  }),
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
    })
    .optional(),
};

/**
 * get a document
 */
const getDocument = {
  params: Joi.object().keys({
    barcode: Joi.string().custom(commonValidation.objectId),
  }),
};

const getGroupId = {
  params: Joi.object().keys({
    id: Joi.string(),
  }),
};

const getBarcode = {
  params: Joi.object().keys({
    barcode: Joi.string(),
  }),
};
/**
 * delete a document
 */
const deleteDocument = {
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
  getDocument,
  getGroupId,
  getBarcode,
};
