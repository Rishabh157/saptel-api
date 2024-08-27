const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");
const { userRoleType } = require("../../helper/enumUtils");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    userName: Joi.string().lowercase().required(),
    mobile: Joi.string()

      .custom(commonValidation.indianMobile)
      .allow(""),
    email: Joi.string().allow(""),
    password: Joi.string().required(),
    userType: Joi.string(),
    allowedIp: Joi.array().items(Joi.string()).default([]),
    companyId: Joi.string().custom(commonValidation.objectId).allow(null),
    branchId: Joi.string().custom(commonValidation.objectId).allow(null),
    callCenterId: Joi.string().custom(commonValidation.objectId).allow(null),
    floorManagerId: Joi.string().custom(commonValidation.objectId).allow(null),
    teamLeadId: Joi.string().custom(commonValidation.objectId).allow(null),
    userDepartment: Joi.string().required(),
    userRole: Joi.string().required(),
    isAgent: Joi.boolean(),
    mySenior: Joi.when("userRole", {
      is: Joi.valid(
        userRoleType.avpSales,
        userRoleType.avpHr,
        userRoleType.avpDistribution,
        userRoleType.avpFinance,
        userRoleType.avpMedia,
        userRoleType.avpMediaProduction,
        userRoleType.avpIT,
        userRoleType.avpDevelopment,
        userRoleType.avpWebDevelopment,
        userRoleType.avpOperations,
        userRoleType.avpQA,
        userRoleType.avpLogistics,
        userRoleType.avpMapping,
        userRoleType.avpAdmin,
        userRoleType.customerCareAvp
      ),
      then: Joi.string().custom(commonValidation.objectId).allow(null),
      otherwise: Joi.string().custom(commonValidation.objectId).required(),
    }),
  }),
};

/**
 * update existing document
 */
const update = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    userName: Joi.string().lowercase().required(),
    mobile: Joi.string()

      .custom(commonValidation.indianMobile)
      .allow(""),
    email: Joi.string().allow(""),
    // password: Joi.string().optional(),
    userType: Joi.string(),
    allowedIp: Joi.array().items(Joi.string()).default([]),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
    branchId: Joi.string().custom(commonValidation.objectId).required(),
    callCenterId: Joi.string().custom(commonValidation.objectId).allow(null),
    floorManagerId: Joi.string().custom(commonValidation.objectId).allow(null),
    teamLeadId: Joi.string().custom(commonValidation.objectId).allow(null),
    userDepartment: Joi.string().required(),
    userRole: Joi.string().required(),
    isAgent: Joi.boolean(),
    mySenior: Joi.when("userRole", {
      is: Joi.valid(
        userRoleType.avpSales,
        userRoleType.avpHr,
        userRoleType.avpDistribution,
        userRoleType.avpFinance,
        userRoleType.avpMedia,
        userRoleType.avpMediaProduction,
        userRoleType.avpIT,
        userRoleType.avpDevelopment,
        userRoleType.avpWebDevelopment,
        userRoleType.avpOperations,
        userRoleType.avpQA,
        userRoleType.avpLogistics,
        userRoleType.avpMapping,
        userRoleType.avpAdmin,
        userRoleType.customerCareAvp
      ),
      then: Joi.string().custom(commonValidation.objectId).allow(null),
      otherwise: Joi.string().custom(commonValidation.objectId).required(),
    }),
  }),
};

const updateUserCompany = {
  param: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
  body: Joi.object().keys({
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
      mobile: Joi.string().custom(commonValidation.indianMobile).optional(),
      email: Joi.string().optional(),
    })
    .optional(),
};

/**
 * delete a document
 */
const deleteDocument = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const getById = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * get either all data or single document
 */
const getAllDistribution = {
  params: Joi.object().keys({
    companyid: Joi.string().custom(commonValidation.objectId),
    role: Joi.string(),
  }),
};

const getAllFloorManagersAndTeamLead = {
  params: Joi.object().keys({
    companyid: Joi.string().custom(commonValidation.objectId),
    departmentid: Joi.string(),
    callcenterid: Joi.string().required(),
  }),
};

const getAllAgents = {
  params: Joi.object().keys({
    departmentid: Joi.string(),
    callcenterid: Joi.string().required(),
  }),
};

const getAllUsers = {
  params: Joi.object().keys({
    userrole: Joi.string().required(),
  }),
  body: Joi.object().keys({
    department: Joi.string().allow(""),
    callCenterId: Joi.string().allow(""),
  }),
};
/**
 * refresh token
 */
const refreshTokenValid = {
  body: Joi.object()
    .keys({
      refreshToken: Joi.string().required(),
    })
    .required(),
};
/**
 * change status of document
 */
const changeStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

/**
 * login
 */
const loginValid = {
  body: Joi.object()
    .keys({
      userName: Joi.string().required(),
      password: Joi.string().required(),
    })
    .required(),
};

/**
 * changePassword
 */
const changePasswordValid = {
  body: Joi.object()
    .keys({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
      userId: Joi.string().custom(commonValidation.objectId).required(),
    })
    .required(),
};
// change password by admin
const changePasswordByAdmin = {
  body: Joi.object()
    .keys({
      newPassword: Joi.string().required(),
      userId: Joi.string().custom(commonValidation.objectId).required(),
    })
    .required(),
};

/**
 * verify otp
 */
const verifyOtpValid = {
  body: Joi.object()
    .keys({
      otp: Joi.string().required(),
    })
    .required(),
};

/**
 * exports
 */
module.exports = {
  create,
  getAllFilter,
  get,
  update,
  deleteDocument,
  changeStatus,
  loginValid,
  verifyOtpValid,
  getAllDistribution,
  getById,
  refreshTokenValid,
  changePasswordValid,
  getAllFloorManagersAndTeamLead,
  getAllUsers,
  changePasswordByAdmin,
  updateUserCompany,
  getAllAgents,
};
