const Joi = require("joi");
const httpStatus = require("http-status");
const pick = require("../../utils/pick");
const ApiError = require("../../utils/apiErrorUtils");
const webLeadsErrorSchema = require("../src/webLeads/webLeadsErrorLog/WebLeadErrorLogSchema");

const validate = (schema) => async (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (error) {
    let errorMsg = [];
    const errorMessage = error.details.map((details) => {
      errorMsg.push(details.message.replace(/"/g, `'`));
      details.message;
    });

    // just for temporary logs of web leads
    if (req.rawHeaders.includes("/v1/webleads/add")) {
      await webLeadsErrorSchema.create({
        name: req.body.name || "",
        phone: req.body.phone || "",
        product_name: req.body.product_name || "",
        response: errorMsg,
      });
    }

    return res.status(httpStatus.BAD_REQUEST).send({
      message: errorMsg.toString(),
      status: false,
      data: null,
      code: "INVALID_DATA",
      issue: "INVALID_DATA",
    });
    // return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
