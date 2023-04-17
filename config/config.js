const dotenv = require("dotenv");
const Joi = require("joi");
// const logger = require('../config/logger')
dotenv.config();

let {
  PROJECT_NAME,
  NODE_ENV,
  PORT,
  MONGODB_URL,
  JWT_SECRET,
  JWT_SECRET_REFRESH,
  JWT_EXPIRATION_MINUTES,
  LOCALHOST,
  BASEURL_LOCAL,
  JWT_SECRET_OTP,
  JWT_EXPIRATION_MINUTES_OTP,
} = process.env;

let envObj = {
  PROJECT_NAME,
  NODE_ENV,
  PORT,
  MONGODB_URL,
  JWT_SECRET,
  JWT_SECRET_REFRESH,
  JWT_EXPIRATION_MINUTES,
  LOCALHOST,
  BASEURL_LOCAL,

  JWT_SECRET_OTP,
  JWT_EXPIRATION_MINUTES_OTP,
};
const envVarsSchema = Joi.object().keys({
  PROJECT_NAME: Joi.string().default("RARE_EXP").required(),
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.number().default(3000),
  MONGODB_URL: Joi.string().required().label("Mongo DB url"),
  LOCALHOST: Joi.string().required().label("localhost url is required"),
  BASEURL_LOCAL: Joi.string().required().label("Base url is url"),
  JWT_SECRET: Joi.string().required().label("JWT secret key"),
  JWT_SECRET_REFRESH: Joi.string().required().label("JWT secret refresh key"),
  JWT_EXPIRATION_MINUTES: Joi.string()
    .default("10 hours")
    .description("minutes after which token expires"),
  JWT_SECRET_OTP: Joi.string().required().label("JWT Otp secret key"),
  JWT_EXPIRATION_MINUTES_OTP: Joi.string()
    .default("20 minutes")
    .description("minutes after which otp token expires"),
});

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(envObj);

if (error) {
  // logger.info(error)
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
    },
  },
  project: envVars.PROJECT_NAME,
  localhost: envVars.LOCALHOST,
  jwt_secret: envVars.JWT_SECRET,
  jwt_secret_refresh: envVars.JWT_SECRET_REFRESH,
  jwt_expires: envVars.JWT_EXPIRATION_MINUTES,
  jwt_secret_otp: envVars.JWT_SECRET_OTP,
  jwt_expires_otp: envVars.JWT_EXPIRATION_MINUTES_OTP,
  localhost: envVars.LOCALHOST,

  base_url:
    envVars.NODE_ENV === "development"
      ? envVars.BASEURL_LOCAL + ":" + envVars.PORT + "/"
      : envVars.BASEURL_LIVE,
};
