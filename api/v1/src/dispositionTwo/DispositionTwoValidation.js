const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

//===============create new document===============
const create = {
  body: Joi.object().keys({
    dispositionName: Joi.string().lowercase().required(),
    dispositionOneId: Joi.string().custom(commonValidation.objectId).required(),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

//===============update document===============
const update = {
  params: Joi.object().keys({
    id: Joi.required().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    dispositionName: Joi.string().lowercase().required(),
    dispositionOneId: Joi.string().custom(commonValidation.objectId).required(),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};
//===============get either all data or single document===============
const get = {
  params: Joi.object().keys({
    companyid: Joi.string().custom(commonValidation.objectId),
  }),
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
      dispositionName: Joi.string().optional(),
    })
    .optional(),
};

//===============getbyid document===============
const getById = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};

//===============change status of document===============
const getByDispositionOneId = {
  query: Joi.object()
    .keys({
      dispositionOneId: Joi.string()
        .custom(commonValidation.objectId)
        .optional(),
    })
    .optional(),
};
//===============  filter and pagination api===============
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
//===============change status of document===============
const changeStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};

//===============delete a document===============
const deleteDocument = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};
module.exports = {
  create,
  update,
  get,
  getById,
  changeStatus,
  getByDispositionOneId,
  getAllFilter,
  deleteDocument,
};
