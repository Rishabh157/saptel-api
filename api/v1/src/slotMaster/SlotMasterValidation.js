const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    slotName: Joi.string().lowercase().required(),
    channelGroupId: Joi.string().custom(commonValidation.objectId).required(),
    type: Joi.string().required(),
    tapeNameId: Joi.string().custom(commonValidation.objectId).required(),
    channelNameId: Joi.string().custom(commonValidation.objectId).required(),
    channelTrp: Joi.string().lowercase().required(),
    slotPrice: Joi.number().required(),
    slotDay: Joi.array().items(Joi.string()).required(),
    slotStartTime: Joi.string().required(),
    slotEndTime: Joi.string().required(),
    slotContinueStatus: Joi.boolean().required(),
    run: Joi.boolean(),
    runStartTime: Joi.string().allow(""),
    runEndTime: Joi.string().allow(""),
    runRemark: Joi.string().allow(""),
    runYoutubeLink: Joi.string().allow(""),
    runStatus: Joi.boolean(),
    remarks: Joi.string().lowercase().allow(""),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
    showOk: Joi.boolean(),
    reasonNotShow: Joi.string().allow(null),
    slotRunImage: Joi.string().allow(""),
    slotRunVideo: Joi.string().allow(""),
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
    slotName: Joi.string().lowercase().required(),
    channelGroupId: Joi.string().custom(commonValidation.objectId).required(),
    type: Joi.string().required(),
    tapeNameId: Joi.string().custom(commonValidation.objectId).required(),
    channelNameId: Joi.string().custom(commonValidation.objectId).required(),
    channelTrp: Joi.string().lowercase().required(),
    slotPrice: Joi.number().required(),
    slotDay: Joi.array().items(Joi.string()).required(),
    slotStartTime: Joi.string().required(),
    slotEndTime: Joi.string().required(),
    slotContinueStatus: Joi.boolean().required(),
    run: Joi.boolean(),
    runStartTime: Joi.string().allow(""),
    runEndTime: Joi.string().allow(""),
    runRemark: Joi.string().allow(""),
    runYoutubeLink: Joi.string().allow(""),
    runStatus: Joi.boolean(),
    remarks: Joi.string().lowercase().allow(""),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
    showOk: Joi.boolean(),
    reasonNotShow: Joi.string().allow(null),
    slotRunImage: Joi.string().allow(""),
    slotRunVideo: Joi.string().allow(""),
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
      slotName: Joi.string().optional(),
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
