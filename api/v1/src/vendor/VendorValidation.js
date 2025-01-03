const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    companyName: Joi.string().lowercase().required(),
    companyType: Joi.string().required(),
    ownerShipType: Joi.string().required(),
    websiteAddress: Joi.string().allow(""),
    registrationAddress: Joi.object().keys({
      phone: Joi.string().required(),
      address: Joi.string().required(),
      countryId: Joi.string().custom(commonValidation.objectId).required(),
      stateId: Joi.string().custom(commonValidation.objectId).required(),
      districtId: Joi.string().custom(commonValidation.objectId).required(),
      pincodeId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    billingAddress: Joi.object().keys({
      phone: Joi.string().required(),
      address: Joi.string().required(),
      countryId: Joi.string().custom(commonValidation.objectId).required(),
      stateId: Joi.string().custom(commonValidation.objectId).required(),
      districtId: Joi.string().custom(commonValidation.objectId).required(),
      pincodeId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    contactInformation: Joi.array().items({
      name: Joi.string().allow(""),
      department: Joi.string().allow(""),
      designation: Joi.string().allow(""),
      email: Joi.string().allow(""),
      mobileNumber: Joi.string().allow(""),
      landLine: Joi.string().allow(""),
    }),
    document: Joi.object().keys({
      gstNumber: Joi.string().allow(""),
      gstCertificate: Joi.string().allow(""),
      panNumber: Joi.string().allow(""),
      panCard: Joi.string().allow(""),
      declarationForm: Joi.string().allow(""),
    }),
    bankInformation: Joi.array().items({
      bankName: Joi.string().allow(""),
      bankBranchName: Joi.string().allow(""),
      accountHolderName: Joi.string().allow(""),
      ifscNumber: Joi.string().allow(""),
      accountType: Joi.string().allow(""),
      accountNumber: Joi.string().allow(""),
      cancelledCheque: Joi.string().allow(""),
    }),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
    openingBalance: Joi.number().allow(),
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
    companyName: Joi.string().lowercase().required(),
    companyType: Joi.string().required(),
    ownerShipType: Joi.string().required(),
    websiteAddress: Joi.string().allow(""),
    registrationAddress: Joi.object().keys({
      phone: Joi.string().required(),
      address: Joi.string().required(),
      countryId: Joi.string().custom(commonValidation.objectId).required(),
      stateId: Joi.string().custom(commonValidation.objectId).required(),
      districtId: Joi.string().custom(commonValidation.objectId).required(),
      pincodeId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    billingAddress: Joi.object().keys({
      phone: Joi.string().required(),
      address: Joi.string().required(),
      countryId: Joi.string().custom(commonValidation.objectId).required(),
      stateId: Joi.string().custom(commonValidation.objectId).required(),
      districtId: Joi.string().custom(commonValidation.objectId).required(),
      pincodeId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    contactInformation: Joi.array().items({
      name: Joi.string().allow(""),
      department: Joi.string().allow(""),
      designation: Joi.string().allow(""),
      email: Joi.string().allow(""),
      mobileNumber: Joi.string().allow(""),
      landLine: Joi.string().allow(""),
    }),
    document: Joi.object().keys({
      gstNumber: Joi.string().allow(""),
      gstCertificate: Joi.string().allow(""),
      panNumber: Joi.string().allow(""),
      panCard: Joi.string().allow(""),
      declarationForm: Joi.string().allow(""),
    }),
    bankInformation: Joi.array().items({
      bankName: Joi.string().allow(""),
      bankBranchName: Joi.string().allow(""),
      accountHolderName: Joi.string().allow(""),
      ifscNumber: Joi.string().allow(""),
      accountType: Joi.string().allow(""),
      accountNumber: Joi.string().allow(""),
      cancelledCheque: Joi.string().allow(""),
    }),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
    openingBalance: Joi.number().allow(),
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
  // params: Joi.object().keys({
  //   companyid: Joi.string().custom(commonValidation.objectId),
  // }),
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
      companyName: Joi.string().optional(),
      vendorCode: Joi.string().optional(),
    })
    .optional(),
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
  getDocument,
};
