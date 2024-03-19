const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * get either all data or single document
 */
const get = {
  params: Joi.object()
    .keys({
      harId: Joi.string().custom(commonValidation.objectId).required(),
    })
    .optional(),
};

module.exports = {
  get,
};
