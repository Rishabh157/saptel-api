const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("./CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    tapeName: Joi.string().lowercase().required(),
    tapeType: Joi.string().lowercase(),
    schemeId: Joi.string().allow(null).custom(commonValidation.objectId),
    languageId: Joi.array().items(
      Joi.allow(null).custom(commonValidation.objectId).required()
    ),
    duration: Joi.string().lowercase().required().allow(""),
    artistId: Joi.array().items(
      Joi.allow(null).custom(commonValidation.objectId).required()
    ),
    phone: Joi.array().items(Joi.string().required()),
    youtubeLink: Joi.string().allow(""),
    webSiteLink: Joi.string().allow(""),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
    remarks: Joi.string().lowercase().allow(""),
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
    tapeName: Joi.string().lowercase().required(),
    tapeType: Joi.string().lowercase(),
    schemeId: Joi.string().allow(null).custom(commonValidation.objectId),
    languageId: Joi.array().items(
      Joi.allow(null).custom(commonValidation.objectId).required()
    ),
    duration: Joi.string().lowercase().required().allow(""),
    artistId: Joi.array().items(
      Joi.allow(null).custom(commonValidation.objectId).required()
    ),
    phone: Joi.array().items(Joi.string().required()),
    youtubeLink: Joi.string().allow(""),
    webSiteLink: Joi.string().allow(""),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
    remarks: Joi.string().lowercase().allow(""),
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
      tapeName: Joi.string().optional(),
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
/**
 * get by id
 */
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
};
