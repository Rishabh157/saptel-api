const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("./CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    didNo: Joi.string().required(),
    prepaidOrderNumber: Joi.number().required(),
    inOutBound: Joi.string().allow(""),
    incomingCallerNo: Joi.string().allow(""),
    mobileNo: Joi.string().required(),
    deliveryCharges: Joi.number(),
    discount: Joi.number(),
    total: Joi.number(),
    countryId: Joi.string().custom(commonValidation.objectId).required(),
    stateId: Joi.string().custom(commonValidation.objectId).required(),
    districtId: Joi.string().custom(commonValidation.objectId).required(),
    tehsilId: Joi.string().custom(commonValidation.objectId).required(),
    pincodeId: Joi.string().custom(commonValidation.objectId).required(),
    schemeId: Joi.string().custom(commonValidation.objectId).required(),
    areaId: Joi.string().custom(commonValidation.objectId).required(),
    expectedDeliveryDate: Joi.string().allow(""),
    profileDeliveredBy: Joi.string().allow(""),
    complaintDetails: Joi.string().allow(""),
    complaintNo: Joi.string().allow(""),
    agentName: Joi.string().allow(""),
    name: Joi.string().allow(""),
    age: Joi.number(),
    address: Joi.string().allow(""),
    agentDistrictId: Joi.string().custom(commonValidation.objectId).required(),
    realtion: Joi.string().required(),
    landmark: Joi.string().required(),
    alternateNo1: Joi.string().allow(""),
    watsappNo: Joi.string().allow(""),
    gender: Joi.string().required(),
    prepaid: Joi.boolean(),
    emailId: Joi.string().allow(""),
    channel: Joi.string().custom(commonValidation.objectId).allow(""),
    remark: Joi.string().lowercase().allow(""),
    dispositionLevelTwoId: Joi.string()
      .custom(commonValidation.objectId)
      .required(),
    dispositionLevelThreeId: Joi.string()
      .custom(commonValidation.objectId)
      .required(),
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
    didNo: Joi.string().required(),
    prepaidOrderNumber: Joi.number().required(),
    inOutBound: Joi.string().allow(""),
    incomingCallerNo: Joi.string().allow(""),
    mobileNo: Joi.string().required(),
    deliveryCharges: Joi.number(),
    discount: Joi.number(),
    total: Joi.number(),
    countryId: Joi.string().custom(commonValidation.objectId).required(),
    stateId: Joi.string().custom(commonValidation.objectId).required(),
    districtId: Joi.string().custom(commonValidation.objectId).required(),
    tehsilId: Joi.string().custom(commonValidation.objectId).required(),
    pincodeId: Joi.string().custom(commonValidation.objectId).required(),
    schemeId: Joi.string().custom(commonValidation.objectId).required(),
    areaId: Joi.string().custom(commonValidation.objectId).required(),
    expectedDeliveryDate: Joi.string().allow(""),
    profileDeliveredBy: Joi.string().allow(""),
    complaintDetails: Joi.string().allow(""),
    complaintNo: Joi.string().allow(""),
    agentName: Joi.string().allow(""),
    name: Joi.string().allow(""),
    age: Joi.number(),
    address: Joi.string().allow(""),
    agentDistrictId: Joi.string().custom(commonValidation.objectId).required(),
    relation: Joi.string().required(),
    landmark: Joi.string().required(),
    alternateNo1: Joi.string().allow(""),
    watsappNo: Joi.string().allow(""),
    gender: Joi.string().required(),
    prepaid: Joi.boolean(),
    emailId: Joi.string().allow(""),
    channel: Joi.string().allow(""),
    remark: Joi.string().lowercase().allow(""),
    dispositionLevelTwoId: Joi.string()
      .custom(commonValidation.objectId)
      .required(),
    dispositionLevelThreeId: Joi.string()
      .custom(commonValidation.objectId)
      .required(),
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
  getAllFilter,
  get,
  // update,
  deleteDocument,
  changeStatus,
  getById,
};
