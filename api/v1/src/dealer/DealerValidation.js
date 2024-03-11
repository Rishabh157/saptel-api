const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    dealerCode: Joi.string().lowercase().required(),
    firmName: Joi.string().lowercase().required(),
    firstName: Joi.string().lowercase().required(),
    lastName: Joi.string().lowercase().required(),
    creditLimit: Joi.number().allow(),
    openingBalance: Joi.number().allow(),
    quantityQuotient: Joi.number().allow(),
    isAutoMapping: Joi.boolean().required(),
    isCheckCreditLimit: Joi.boolean().required(),
    isCheckAvailableQuotient: Joi.boolean().required(),
    dealerCategoryId: Joi.string().custom(commonValidation.objectId).required(),
    email: Joi.string().lowercase().required(),
    password: Joi.string().required(),
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
      adharCardNumber: Joi.string().required(),
      adharCard: Joi.string().required(),
    }),
    otherDocument: Joi.array().items({
      documentName: Joi.string().allow(""),
      documentFile: Joi.string().allow(""),
    }),

    companyId: Joi.string().custom(commonValidation.objectId).required(),
    zonalManagerId: Joi.string().custom(commonValidation.objectId).allow(null),
    zonalExecutiveId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    ratio: Joi.number().allow(null),
    priority: Joi.number().allow(null),
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
    dealerCode: Joi.string().lowercase().required(),
    firmName: Joi.string().lowercase().required(),
    firstName: Joi.string().lowercase().required(),
    lastName: Joi.string().lowercase().required(),
    creditLimit: Joi.number().allow(),
    openingBalance: Joi.number().allow(),
    quantityQuotient: Joi.number().allow(),
    isAutoMapping: Joi.boolean().required(),
    isCheckCreditLimit: Joi.boolean().required(),
    isCheckAvailableQuotient: Joi.boolean().required(),
    dealerCategoryId: Joi.string().custom(commonValidation.objectId).required(),
    email: Joi.string().lowercase().required(),
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
      adharCardNumber: Joi.string().required(),
      adharCard: Joi.string().required(),
    }),
    otherDocument: Joi.array().items({
      documentName: Joi.string().allow(""),
      documentFile: Joi.string().uri().allow(""),
    }),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
    zonalManagerId: Joi.string().custom(commonValidation.objectId).allow(null),
    zonalExecutiveId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    openingBalance: Joi.number().allow(),
    ratio: Joi.number().allow(null),
    priority: Joi.number().allow(null),
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

const refreshTokenValid = {
  body: Joi.object()
    .keys({
      refreshToken: Joi.string().required(),
    })
    .required(),
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
      dealerCode: Joi.string().optional(),
    })
    .optional(),
};

/**
 * pincode wise dealer
 */
const getByPincode = {
  params: Joi.object().keys({
    companyid: Joi.string().custom(commonValidation.objectId),
    pincodeid: Joi.string().custom(commonValidation.objectId),
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
const loginValid = {
  body: Joi.object()
    .keys({
      dealerCode: Joi.string().required(),
      password: Joi.string().required(),
    })
    .required(),
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
/**
 * change status of document
 */
const autoMappingChange = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};

const changePasswordValid = {
  body: Joi.object()
    .keys({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
      dealerEmail: Joi.string().required(),
    })
    .required(),
};

const changeDealerPassword = {
  body: Joi.object()
    .keys({
      newPassword: Joi.string().required(),
      dealerCode: Joi.string().required(),
    })
    .required(),
};

module.exports = {
  create,
  getAllFilter,
  get,
  update,
  deleteDocument,
  changeStatus,
  autoMappingChange,
  getDocument,
  loginValid,
  refreshTokenValid,
  getByPincode,
  changePasswordValid,
  changeDealerPassword,
};
