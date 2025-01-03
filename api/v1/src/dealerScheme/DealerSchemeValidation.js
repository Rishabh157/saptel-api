const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    dealerId: Joi.string().custom(commonValidation.objectId).required(),
    details: Joi.array()
      .items({
        schemeId: Joi.string().custom(commonValidation.objectId).required(),
        pincodes: Joi.array().items(Joi.string().required()),
      })
      .required(),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

// scheme to dealer mapping
const schemeToDealer = {
  body: Joi.object().keys({
    schemeId: Joi.string().custom(commonValidation.objectId).required(),
    dealers: Joi.array().items(Joi.string()).allow(),
    dealersToRemove: Joi.array().items(Joi.string()).allow(),
  }),
};

// dealer to scheme mapping
const DealerToscheme = {
  body: Joi.object().keys({
    dealerId: Joi.string().custom(commonValidation.objectId).required(),
    schemesToRemove: Joi.array().items(Joi.string()).allow(),
    schemes: Joi.array().items(Joi.string()).required(),
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
    dealerId: Joi.string().custom(commonValidation.objectId).required(),
    schemeId: Joi.string().custom(commonValidation.objectId).required(),
    pincodes: Joi.array().items(Joi.string().required()),
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
      dealerId: Joi.string().optional(),
    })
    .optional(),
};

// get by pincode

const geserviceability = {
  body: Joi.object().keys({
    pincode: Joi.string().allow(null),
    dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
    schemeId: Joi.string().custom(commonValidation.objectId).allow(null),
  }),
  query: Joi.object().keys({
    page: Joi.number(),
    limit: Joi.number(),
  }),
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
 * get a document
 */
const getDealerScheme = {
  params: Joi.object().keys({
    dealerid: Joi.string().custom(commonValidation.objectId),
    companyid: Joi.string().custom(commonValidation.objectId),
  }),
};

const getDealerBySchemeAndPincode = {
  params: Joi.object().keys({
    pid: Joi.string(),
    sid: Joi.string().custom(commonValidation.objectId),
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
  getDocument,
  getDealerScheme,
  deleteDocument,
  changeStatus,
  getDealerBySchemeAndPincode,
  schemeToDealer,
  DealerToscheme,
  geserviceability,
};
