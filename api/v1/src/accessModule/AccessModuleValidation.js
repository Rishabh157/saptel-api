const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");
const { apiAppEnum } = require("../../helper/enumUtils");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    route: Joi.string().required().lowercase(),
    method: Joi.string().required().lowercase(),
    actionName: Joi.string().required().lowercase(),
    actionDisplayName: Joi.string().required().lowercase(),
    actionDisplayRank: Joi.number().required(),
    modelName: Joi.string().required().lowercase(),
    modelDisplayName: Joi.string().required().lowercase(),
    modelDisplayRank: Joi.number().required(),
    acccessType: Joi.array()
      .items(
        Joi.string()
          .optional()
          .valid(
            `${apiAppEnum.all}`,
            `${apiAppEnum.app}`,
            `${apiAppEnum.dashboard}`,
            `${apiAppEnum.web}`
          )
          .lowercase()
      )
      .empty(Joi.array().length(0)),
    fields: Joi.array().items(
      Joi.object().keys({
        fieldDisplayName: Joi.string().lowercase().allow(""),
        fieldName: Joi.string().allow(""),
        fieldRank: Joi.number().required(),
      })
    ),
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
    route: Joi.string().required().lowercase(),
    method: Joi.string().required().lowercase(),
    actionName: Joi.string()
      .custom(commonValidation.accessactionNameCheck)
      .required()
      .lowercase(),
    actionDisplayName: Joi.string().required().lowercase(),
    actionDisplayRank: Joi.number().required(),
    modelName: Joi.string().required().lowercase(),
    modelDisplayName: Joi.string().required().lowercase(),
    modelDisplayRank: Joi.number().required(),
    acccessType: Joi.array()
      .items(
        Joi.string()
          .optional()
          .valid(
            `${apiAppEnum.all}`,
            `${apiAppEnum.app}`,
            `${apiAppEnum.dashboard}`,
            `${apiAppEnum.web}`
          )
          .lowercase()
      )
      .empty(Joi.array().length(0)),
    fields: Joi.array().items(
      Joi.object().keys({
        fieldDisplayName: Joi.string().lowercase().allow(""),
        fieldName: Joi.string().allow(""),
        fieldRank: Joi.number().required(),
      })
    ),
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
};
