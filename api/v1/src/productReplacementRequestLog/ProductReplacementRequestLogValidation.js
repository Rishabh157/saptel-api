const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * get either all data or single document
 */
const get = {
  query: Joi.object()
    .keys({
      productReplacementRequestId: Joi.string().custom(
        commonValidation.objectId
      ),
    })
    .optional(),
};

module.exports = {
  get,
};
