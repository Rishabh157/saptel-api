const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    rtvNumber: Joi.string(),
    vendorId: Joi.custom(commonValidation.objectId).required(),
    warehouseId: Joi.custom(commonValidation.objectId).required(),
    firstApproved: Joi.boolean().allow(null),
    firstApprovedActionBy: Joi.string().allow(""),
    firstApprovedAt: Joi.string().allow(""),
    secondApproved: Joi.boolean().allow(null),
    secondApprovedActionBy: Joi.string().allow(""),
    secondApprovedAt: Joi.string().allow(""),
    firstApprovedById: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    secondApprovedById: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    productSalesOrder: Joi.array().items({
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      rate: Joi.number().required(),
      quantity: Joi.number().required(),
    }),
    remark: Joi.string().lowercase(),
    status: Joi.string(),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * update existing document
 */
const update = {
  body: Joi.object().keys({
    rtvData: Joi.array().items({
      id: Joi.string().allow(""),
      rtvNumber: Joi.string(),
      vendorId: Joi.custom(commonValidation.objectId).required(),
      warehouseId: Joi.custom(commonValidation.objectId).required(),
      firstApproved: Joi.boolean().allow(null),
      firstApprovedActionBy: Joi.string().allow(""),
      firstApprovedAt: Joi.string().allow(""),
      secondApproved: Joi.boolean().allow(null),
      secondApprovedActionBy: Joi.string().allow(""),
      secondApprovedAt: Joi.string().allow(""),
      firstApprovedById: Joi.string()
        .custom(commonValidation.objectId)
        .allow(null),
      secondApprovedById: Joi.string()
        .custom(commonValidation.objectId)
        .allow(null),
      productSalesOrder: Joi.object().keys({
        productGroupId: Joi.string()
          .custom(commonValidation.objectId)
          .required(),
        rate: Joi.number().required(),
        quantity: Joi.number().required(),
      }),
      remark: Joi.string().lowercase(),
      // status: Joi.string(),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
  }),
};

/**
 * update rtv approval level
 */
const updateApproval = {
  params: Joi.object().keys({
    rtvNumber: Joi.required(),
  }),
  body: Joi.object().keys({
    type: Joi.string().required(),
    firstApprovedAt: Joi.string().allow(""),
    secondApprovedAt: Joi.string().allow(""),
    firstApprovedById: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    secondApprovedById: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    firstApprovedActionBy: Joi.string().allow(""),
    secondApprovedActionBy: Joi.string().allow(""),
    secondApproved: Joi.boolean(),
    firstApproved: Joi.boolean(),
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
      rtvNumber: Joi.string().optional(),
    })
    .optional(),
};

/**
 * delete a document
 */
const deleteDocument = {
  params: Joi.object().keys({
    rtvnumber: Joi.string(),
  }),
};

/**
 * get by id
 */
const getById = {
  params: Joi.object().keys({
    rtvnumber: Joi.string(),
  }),
};

// update rtv status
const updateRtvStatus = {
  params: Joi.object().keys({
    rtvnumber: Joi.string(),
    status: Joi.string(),
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
  updateApproval,
  updateRtvStatus,
};
