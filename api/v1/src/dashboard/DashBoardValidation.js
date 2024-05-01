const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");
const { orderStatusEnum } = require("../../helper/enumUtils");

const getAgentDashboardData = {
  body: Joi.object().keys({
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
  }),
};
const getZmDashboardData = {
  body: Joi.object().keys({
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
    schemeId: Joi.string().custom(commonValidation.objectId).allow(null),
  }),
};

const getWhDashboardData = {
  params: Joi.object().keys({
    wid: Joi.string().custom(commonValidation.objectId),
  }),
};

const getDealerDashboardData = {
  params: Joi.object().keys({
    dealerid: Joi.string().custom(commonValidation.objectId),
  }),
};

const getOrderDashboardCount = {
  body: Joi.object().keys({
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
  }),
};

const getWhInwartOutwardData = {
  params: Joi.object().keys({
    wid: Joi.string().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
  }),
};

module.exports = {
  getAgentDashboardData,
  getZmDashboardData,
  getWhDashboardData,
  getWhInwartOutwardData,
  getDealerDashboardData,
  getOrderDashboardCount,
};
