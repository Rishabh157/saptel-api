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

const getAllInquiryFilter = {
  body: Joi.object().keys({
    params: Joi.array().items(Joi.string().required()),
    searchValue: Joi.string().allow(""),
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string()
          // .custom(commonValidation.dateFormatWithTime)
          .allow(""),
        endDate: Joi.string()
          // .custom(commonValidation.dateFormatWithTime)
          .allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),

    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    orderBy: Joi.string().allow(""),
    orderByValue: Joi.number().valid(1, -1).allow(""),
    isPaginationRequired: Joi.boolean().default(true).optional(),
  }),
};

module.exports = {
  agentOrderStatus,
  agentWiseComplaint,
  getAllInquiryFilter,
};
