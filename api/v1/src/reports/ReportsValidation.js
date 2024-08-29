const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const agentOrderStatus = {
  body: Joi.object().keys({
    callCenterId: Joi.string().custom(commonValidation.objectId).required(),
    agentId: Joi.string().custom(commonValidation.objectId).required(),
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
  }),
};

// Agent wise complaint

const agentWiseComplaint = {
  body: Joi.object().keys({
    schemeId: Joi.string().custom(commonValidation.objectId).allow(null),
    agentId: Joi.string().custom(commonValidation.objectId).allow(null),
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
  agentOrderStatus,
  agentWiseComplaint,
};
