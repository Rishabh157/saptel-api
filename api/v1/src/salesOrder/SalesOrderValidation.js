const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */

const create = {
  body: Joi.object().keys({
    // soNumber: Joi.string().required(),
    dhApproved: Joi.boolean().allow(null),
    dhApprovedActionBy: Joi.string().allow(""),
    expectedDeliveryDate: Joi.string().required(),
    dhApprovedAt: Joi.string().allow(""),
    accApproved: Joi.boolean().allow(null),
    accApprovedActionBy: Joi.string().allow(""),
    accApprovedAt: Joi.string().allow(""),
    dealerId: Joi.string().custom(commonValidation.objectId).required(),
    dhApprovedById: Joi.string().custom(commonValidation.objectId).allow(null),
    accApprovedById: Joi.string().custom(commonValidation.objectId).allow(null),
    dealerWareHouseId: Joi.string()
      .custom(commonValidation.objectId)
      .required(),
    companyWareHouseId: Joi.string()
      .custom(commonValidation.objectId)
      .required(),
    productSalesOrder: Joi.array().items({
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      rate: Joi.number().required(),
      quantity: Joi.number().required(),
    }),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * update po approval level
 */
const updateApproval = {
  params: Joi.object().keys({
    sonumber: Joi.required(),
  }),
  body: Joi.object().keys({
    type: Joi.string().required(),
    dhApprovedAt: Joi.string().allow(""),
    accApprovedAt: Joi.string().allow(""),
    dhApprovedById: Joi.string().custom(commonValidation.objectId).allow(null),
    accApprovedById: Joi.string().custom(commonValidation.objectId).allow(null),
    dhApprovedActionBy: Joi.string().allow(""),
    accApprovedActionBy: Joi.string().allow(""),
    accApproved: Joi.boolean(),
    dhApproved: Joi.boolean(),
    invoice: Joi.string().allow(""),
  }),
};
/**
 * update existing document
 */
const update = {
  // params: Joi.object().keys({
  //   id: Joi.required().custom(commonValidation.objectId),
  // }),
  body: Joi.object().keys({
    soData: Joi.array().items({
      id: Joi.string().allow(""),
      soNumber: Joi.string().required(),
      expectedDeliveryDate: Joi.string().required(),
      dhApproved: Joi.boolean().allow(null),
      dhApprovedActionBy: Joi.string().allow(""),
      dhApprovedAt: Joi.string().allow(""),
      accApproved: Joi.boolean().allow(null),
      accApprovedActionBy: Joi.string().allow(""),
      accApprovedAt: Joi.string().allow(""),
      dhApprovedById: Joi.string()
        .custom(commonValidation.objectId)
        .allow(null),
      accApprovedById: Joi.string()
        .custom(commonValidation.objectId)
        .allow(null),
      // status: Joi.string().required(),
      dealerId: Joi.string().custom(commonValidation.objectId).required(),
      dealerWareHouseId: Joi.string()
        .custom(commonValidation.objectId)
        .required(),
      companyWareHouseId: Joi.string()
        .custom(commonValidation.objectId)
        .required(),
      productSalesOrder: Joi.object().keys({
        productGroupId: Joi.string()
          .custom(commonValidation.objectId)
          .required(),
        rate: Joi.number().required(),
        quantity: Joi.number().required(),
      }),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
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
      soNumber: Joi.string().optional(),
    })
    .optional(),
};
/**
 * get a document
 */
const getDocument = {
  params: Joi.object().keys({
    sonumber: Joi.string(),
  }),
};
/**
 * delete a document
 */
const deleteDocument = {
  params: Joi.object().keys({
    sonumber: Joi.string(),
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

const updateSoStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
    status: Joi.string(),
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
  updateApproval,
  updateSoStatus,
};
