const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    userId: Joi.string().custom(commonValidation.objectId).allow(null),
    departmentId: Joi.string().required(),
    departmentName: Joi.string().required(),

    userRoleId: Joi.string().required(),
    userRoleName: Joi.string().required(),

    module: Joi.array()
      .items({
        moduleId: Joi.string().required(),
        moduleName: Joi.string().required(),

        moduleAction: Joi.array()
          .items({
            actionUrl: Joi.string().required(),
            actionId: Joi.string().required(),
            actionName: Joi.string().required(),

            fields: Joi.array()
              .items({
                fieldId: Joi.string().required(),
                fieldName: Joi.string().required(),

                fieldValue: Joi.string().required(),
              })
              .required(),
          })
          .required(),
      })
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
    userId: Joi.string().custom(commonValidation.objectId),
    departmentId: Joi.string().required(),
    departmentName: Joi.string().required(),

    userRoleId: Joi.string().required(),
    userRoleName: Joi.string().required(),

    module: Joi.array()
      .items({
        moduleId: Joi.string().required(),
        moduleName: Joi.string().required(),

        moduleAction: Joi.array()
          .items({
            actionUrl: Joi.string().required(),
            actionId: Joi.string().required(),
            actionName: Joi.string().required(),

            fields: Joi.array()
              .items({
                fieldId: Joi.string().required(),
                fieldName: Joi.string().required(),

                fieldValue: Joi.string().required(),
              })
              .required(),
          })
          .required(),
      })
      .required(),
  }),
};

/**
 * update all by department
 */
const departmentUpdate = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    departmentId: Joi.string().required(),
    departmentName: Joi.string().required(),

    userRoleId: Joi.string().required(),
    userRoleName: Joi.string().required(),

    module: Joi.array()
      .items({
        moduleId: Joi.string().required(),
        moduleName: Joi.string().required(),

        moduleAction: Joi.array()
          .items({
            actionUrl: Joi.string().required(),
            actionId: Joi.string().required(),
            actionName: Joi.string().required(),

            fields: Joi.array()
              .items({
                fieldId: Joi.string().required(),
                fieldName: Joi.string().required(),

                fieldValue: Joi.string().required(),
              })
              .default([]),
          })
          .default([]),
      })
      .default([]),
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
      userId: Joi.string().custom(commonValidation.objectId).optional(),
      departmentId: Joi.string().optional(),
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
    departmentid: Joi.string(),
    userId: Joi.string().custom(commonValidation.objectId),
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

/**
 * user exists
 */
const userExists = {
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
  departmentUpdate,
  userExists,
};
