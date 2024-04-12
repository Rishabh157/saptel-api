const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    dtdNumber: Joi.string().uppercase().required(),
    fromDealerId: Joi.required().custom(commonValidation.objectId),
    toDealerId: Joi.required().custom(commonValidation.objectId),
    remark: Joi.string().lowercase().allow(""),
    productDetails: Joi.array().items({
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      rate: Joi.number().required(),
      quantity: Joi.number().required(),
    }),
  }),
};

/**
 * update existing document
 */
const update = {
  body: Joi.object().keys({
    dtdData: Joi.array().items({
      id: Joi.string().allow(""),
      dtdNumber: Joi.string().uppercase().required(),
      fromDealerId: Joi.required().custom(commonValidation.objectId),
      toDealerId: Joi.required().custom(commonValidation.objectId),
      remark: Joi.string().lowercase().allow(""),
      productDetails: Joi.object().keys({
        productGroupId: Joi.string()
          .custom(commonValidation.objectId)
          .required(),
        rate: Joi.number().required(),
        quantity: Joi.number().required(),
      }),
    }),
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
    myRequestId: Joi.string().custom(commonValidation.objectId).optional(),
  }),
};

/**
 * get either all data or single document
 */
const get = {
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
      dtdNumber: Joi.string().optional(),
    })
    .optional(),
};

/**
 * delete a document
 */
const deleteDocument = {
  params: Joi.object().keys({
    dtdNo: Joi.string(),
  }),
};

/**
 * get by id
 */
const getById = {
  params: Joi.object().keys({
    dtdNo: Joi.string(),
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

const approveStatus = {
  params: Joi.object().keys({
    dtdNo: Joi.string(),
    status: Joi.boolean(),
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
  approveStatus,
};
