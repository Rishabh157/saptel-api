const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    didNo: Joi.string().default(null).optional().allow(null),
    ageGroup: Joi.string().allow(""),
    // agentId: Joi.string().custom(commonValidation.objectId).required(),
    companyCode: Joi.string().required(),
    agentName: Joi.string().required(),

    mobileNo: Joi.string().required(),
    alternateNo: Joi.string().allow(""),
    autoFillingShippingAddress: Joi.string().allow(""),

    callType: Joi.string().allow(""),
    campaign: Joi.string().allow(""),
    customerName: Joi.string().allow(""),
    deliveryTimeAndDate: Joi.string().allow(""),
    countryId: Joi.string().custom(commonValidation.objectId).allow(null),
    countryLabel: Joi.string().allow(""),
    stateId: Joi.string().custom(commonValidation.objectId).allow(null),
    stateLabel: Joi.string().allow(""),
    districtId: Joi.string().custom(commonValidation.objectId).allow(null),
    districtLabel: Joi.string().allow(""),
    tehsilId: Joi.string().custom(commonValidation.objectId).allow(null),
    tehsilLabel: Joi.string().allow(""),
    schemeId: Joi.string().custom(commonValidation.objectId).allow(null),
    schemeName: Joi.string().allow(""),
    pincodeId: Joi.string().custom(commonValidation.objectId).allow(null),
    pincodeLabel: Joi.string().allow(""),

    areaId: Joi.string().custom(commonValidation.objectId).allow(null),
    areaLabel: Joi.string().allow(""),
    emailId: Joi.string().allow(""),
    flagStatus: Joi.string().allow(""),
    gender: Joi.string().allow(""),
    houseNumber: Joi.string().allow(""),
    incomingCallerNo: Joi.string().allow(""),
    landmark: Joi.string().allow(""),
    medicalIssue: Joi.array().items(Joi.string()).default([]),

    orderFor: Joi.array().items(Joi.string()).default([]),
    orderForOther: Joi.string().allow(""),
    paymentMode: Joi.string().allow(""),
    productGroupId: Joi.string().custom(commonValidation.objectId).allow(null),
    // reciversName: Joi.string().allow(""),
    remark: Joi.string().allow(""),
    shcemeQuantity: Joi.number(),
    socialMedia: Joi.object().keys({
      facebook: Joi.string().allow(""),
      instagram: Joi.string().allow(""),
    }),
    streetNumber: Joi.string().allow(""),
    typeOfAddress: Joi.string().allow(""),
    whatsappNo: Joi.string().allow(""),
    price: Joi.number(),
    deliveryCharges: Joi.number(),
    totalAmount: Joi.number(),
    dispositionLevelTwoId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    dispositionLevelTwoLabel: Joi.string().allow(""),
    dispositionLevelThreeLabel: Joi.string().allow(""),
    productGroupLabel: Joi.string().allow(""),
    dispositionLevelThreeId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    preffered_delivery_start_time: Joi.string().allow(""),
    preffered_delivery_end_time: Joi.string().allow(""),
    preffered_delivery_date: Joi.string().allow(""),
    recordingStartTime: Joi.string().allow(""),
    recordingEndTime: Joi.string().allow(""),
    status: Joi.string().required(""),
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
    didNo: Joi.string().default(null).optional(),
    ageGroup: Joi.string().allow(""),
    agentId: Joi.string().custom(commonValidation.objectId).required(),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
    agentName: Joi.string().required(),
    mobileNo: Joi.string().required(),
    alternateNo: Joi.string().allow(""),
    autoFillingShippingAddress: Joi.string().allow(""),
    callType: Joi.string().allow(""),
    campaign: Joi.string().allow(""),
    customerName: Joi.string().allow(""),
    deliveryTimeAndDate: Joi.string().allow(""),
    countryId: Joi.string().custom(commonValidation.objectId).allow(null),
    countryLabel: Joi.string().allow(""),
    stateId: Joi.string().custom(commonValidation.objectId).allow(null),
    stateLabel: Joi.string().allow(""),
    districtId: Joi.string().custom(commonValidation.objectId).allow(null),
    districtLabel: Joi.string().allow(""),
    tehsilId: Joi.string().custom(commonValidation.objectId).allow(null),
    tehsilLabel: Joi.string().allow(""),
    schemeId: Joi.string().custom(commonValidation.objectId).allow(null),
    schemeName: Joi.string().allow(""),
    pincodeId: Joi.string().custom(commonValidation.objectId).allow(null),
    pincodeLabel: Joi.string().allow(""),
    dispositionLevelTwoLabel: Joi.string().allow(""),
    dispositionLevelThreeLabel: Joi.string().allow(""),
    productGroupLabel: Joi.string().allow(""),
    areaId: Joi.string().custom(commonValidation.objectId).allow(null),
    areaLabel: Joi.string().allow(""),
    emailId: Joi.string().allow(""),
    flagStatus: Joi.string().allow(""),
    gender: Joi.string().allow(""),
    houseNumber: Joi.string().allow(""),
    incomingCallerNo: Joi.string().allow(""),
    landmark: Joi.string().allow(""),
    medicalIssue: Joi.array().items(Joi.string()).default([]),
    orderFor: Joi.array().items(Joi.string()).default([]),
    orderForOther: Joi.string().allow(""),
    paymentMode: Joi.string().allow(""),
    productGroupId: Joi.string().custom(commonValidation.objectId).allow(null),
    // reciversName: Joi.string().allow(""),
    remark: Joi.string().allow(""),
    shcemeQuantity: Joi.number(),
    socialMedia: Joi.object().keys({
      facebook: Joi.string().allow(""),
      instagram: Joi.string().allow(""),
    }),
    streetNumber: Joi.string().allow(""),
    typeOfAddress: Joi.string().allow(""),
    whatsappNo: Joi.string().allow(""),
    price: Joi.number(),
    deliveryCharges: Joi.number(),
    totalAmount: Joi.number(),
    dispositionLevelTwoId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    dispositionLevelThreeId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    preffered_delivery_start_time: Joi.string().allow(""),
    preffered_delivery_end_time: Joi.string().allow(""),
    preffered_delivery_date: Joi.string().allow(""),
    recordingStartTime: Joi.string().allow(""),
    recordingEndTime: Joi.string().allow(""),
    status: Joi.string().required(""),
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
  create,
  getAllFilter,
  get,
  update,
  deleteDocument,
  changeStatus,
  getById,
};
