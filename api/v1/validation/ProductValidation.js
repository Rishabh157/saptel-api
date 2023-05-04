const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("./CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    productCode: Joi.string().lowercase().required(),
    productName: Joi.string().lowercase().required(),
    productCategory: Joi.string().custom(commonValidation.objectId).required(),
    productSubCategory: Joi.string()
      .custom(commonValidation.objectId)
      .required(),
    productGroup: Joi.string().custom(commonValidation.objectId).required(),
    productWeight: Joi.number().required(),
    dimension: Joi.object().keys({
      height: Joi.number().required(),
      width: Joi.number().required(),
      depth: Joi.number().required(),
    }),
    productImage: Joi.string().uri().required(),
    description: Joi.string().lowercase().required(),
    item: Joi.array().items({
      itemId: Joi.string().custom(commonValidation.objectId).required(),
      itemQuantity: Joi.number().required(),
    }),
    tax: Joi.array().items({
      taxId: Joi.string().custom(commonValidation.objectId).required(),
      taxPercent: Joi.number().required(),
    }),
    faq: Joi.array().items({
      question: Joi.string().required(),
      answer: Joi.string().required(),
    }),
    video: Joi.array().items({
      videoName: Joi.string().required(),
      videoLink: Joi.string().uri().required(),
    }),
    callScript: Joi.array().items({
      language: Joi.string().custom(commonValidation.objectId).required(),
      script: Joi.string().required(),
    }),
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
    productCode: Joi.string().lowercase().required(),
    productName: Joi.string().lowercase().required(),
    productCategory: Joi.string().custom(commonValidation.objectId).required(),
    productSubCategory: Joi.string()
      .custom(commonValidation.objectId)
      .required(),
    productGroup: Joi.string().custom(commonValidation.objectId).required(),
    productWeight: Joi.number().required(),
    dimension: Joi.object().keys({
      height: Joi.number().required(),
      width: Joi.number().required(),
      depth: Joi.number().required(),
    }),
    productImage: Joi.string().uri().required(),
    description: Joi.string().lowercase().required(),
    item: Joi.array().items({
      itemId: Joi.string().custom(commonValidation.objectId).required(),
      itemQuantity: Joi.number().required(),
    }),
    tax: Joi.array().items({
      taxId: Joi.string().custom(commonValidation.objectId).required(),
      taxPercent: Joi.number().required(),
    }),
    faq: Joi.array().items({
      question: Joi.string().required(),
      answer: Joi.string().required(),
    }),
    video: Joi.array().items({
      videoName: Joi.string().required(),
      videoLink: Joi.string().uri().required(),
    }),
    callScript: Joi.array().items({
      language: Joi.string().custom(commonValidation.objectId).required(),
      script: Joi.string().required(),
    }),
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
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
      productCode: Joi.string().optional(),
      productName: Joi.string().optional(),
    })
    .optional(),
};

/**
 * get a document
 */
const getDocument = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
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
};
