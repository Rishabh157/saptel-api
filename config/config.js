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
  JWT_DELIVERY_BOY_SECRET,
  JWT_DEALER_SECRET,
  JWT_DEALER_SECRET_REFRESH,
  LOCALHOST,
  BASEURL_LOCAL,
  BASEURL_LIVE,
  JWT_SECRET_OTP,
  JWT_EXPIRATION_MINUTES_OTP,
  SERVER_AUTH_KEY,
  DIALER_DOMAIN,
  MONEY_BACK_ID,
  PRODUCT_REPLACEMENT_DISPOSITION,
  RED_FLAG_DISPOSITION,
  OTHER_RED_FLAG_IC2,
  OTHER_RED_FLAG_IC3,
  ORANGE_FLAG_DISPOSITION,
  OTHER_ORANGE_FLAG,
  HOUSE_ARREST_CASE_DISPOSITION,
  SHIPYAARI_BASE_URL,
  SHIPYAARI_EMAIL,
  SHIPYAARI_PASSWORD,
  ORDER_QUEUE_URL,
  TALLY_BASEURL_LOCAL,
  REDIS_URL,
  REDIS_URL_TLS,
  MERCHANT_ID,
  ACCESS_CODE,
  WORKING_KEY,
  CC_AVENUE_VERIFY_PAYMENT_URL,
} = process.env;

let envObj = {
  PROJECT_NAME,
  NODE_ENV,
  PORT,
  MONGODB_URL,
  JWT_SECRET,
  JWT_SECRET_REFRESH,
  JWT_DEALER_SECRET,
  JWT_DEALER_SECRET_REFRESH,
  JWT_EXPIRATION_MINUTES,
  JWT_DELIVERY_BOY_SECRET,
  LOCALHOST,
  BASEURL_LOCAL,
  BASEURL_LIVE,
  JWT_SECRET_OTP,
  JWT_EXPIRATION_MINUTES_OTP,
  SERVER_AUTH_KEY,
  DIALER_DOMAIN,
  MONEY_BACK_ID,
  PRODUCT_REPLACEMENT_DISPOSITION,
  RED_FLAG_DISPOSITION,
  OTHER_RED_FLAG_IC2,
  OTHER_RED_FLAG_IC3,
  ORANGE_FLAG_DISPOSITION,
  OTHER_ORANGE_FLAG,
  HOUSE_ARREST_CASE_DISPOSITION,
  SHIPYAARI_BASE_URL,
  SHIPYAARI_EMAIL,
  SHIPYAARI_PASSWORD,
  ORDER_QUEUE_URL,
  TALLY_BASEURL_LOCAL,
  REDIS_URL,
  REDIS_URL_TLS,
  MERCHANT_ID,
  ACCESS_CODE,
  WORKING_KEY,
  CC_AVENUE_VERIFY_PAYMENT_URL,
};
const envVarsSchema = Joi.object().keys({
  PROJECT_NAME: Joi.string().default("RARE_EXP").required(),
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.number().default(3000),
  MONGODB_URL: Joi.string().required().label("Mongo DB url"),
  LOCALHOST: Joi.string().required().label("localhost url is required"),
  BASEURL_LOCAL: Joi.string().required().label("Base url is url"),
  BASEURL_LIVE: Joi.string().required().label("Base url Live is url"),
  JWT_SECRET: Joi.string().required().label("JWT secret key"),
  JWT_SECRET_REFRESH: Joi.string().required().label("JWT secret refresh key"),
  JWT_DEALER_SECRET: Joi.string().required().label("JWT dealer secret key"),
  JWT_DELIVERY_BOY_SECRET: Joi.string()
    .required()
    .label("JWT delivery boy  secret key"),
  JWT_DEALER_SECRET_REFRESH: Joi.string()
    .required()
    .label("JWT dealer secret refresh key"),
  JWT_EXPIRATION_MINUTES: Joi.string()
    .default("10 hours")
    .description("minutes after which token expires"),
  JWT_SECRET_OTP: Joi.string().required().label("JWT Otp secret key"),
  JWT_EXPIRATION_MINUTES_OTP: Joi.string()
    .default("20 minutes")
    .description("minutes after which otp token expires"),
  SERVER_AUTH_KEY: Joi.string().required().label("Server auth key is required"),
  DIALER_DOMAIN: Joi.string().required().label("Dialer domain key is required"),
  MONEY_BACK_ID: Joi.string().required().label("money back id key is required"),
  PRODUCT_REPLACEMENT_DISPOSITION: Joi.string()
    .required()
    .label("product replacement disposition key is required"),
  RED_FLAG_DISPOSITION: Joi.string()
    .required()
    .label("RED FLAG DISPOSITION key is required"),
  OTHER_RED_FLAG_IC2: Joi.string()
    .required()
    .label("OTHER RED FLAG IC2 is required"),
  OTHER_RED_FLAG_IC3: Joi.string()
    .required()
    .label("OTHER RED FLAG IC3 is required"),
  ORANGE_FLAG_DISPOSITION: Joi.string()
    .required()
    .label("ORANGE FLAG DISPOSITION is required"),
  OTHER_ORANGE_FLAG: Joi.string()
    .required()
    .label("OTHER ORANGE FLAG is required"),
  HOUSE_ARREST_CASE_DISPOSITION: Joi.string()
    .required()
    .label("HOUSE ARREST CASE DISPOSITION is required"),
  SHIPYAARI_BASE_URL: Joi.string()
    .required()
    .label("Shipyaari base url required"),
  SHIPYAARI_EMAIL: Joi.string().required().label("Shipyaari email required"),
  SHIPYAARI_PASSWORD: Joi.string()
    .required()
    .label("Shipyaari password required"),
  ORDER_QUEUE_URL: Joi.string().required().label("Order queue url required"),
  TALLY_BASEURL_LOCAL: Joi.string().required().label("Tally url required"),
  REDIS_URL: Joi.string().required().label("REDIS URL url"),
  REDIS_URL_TLS: Joi.string().required().label("REDIS URL TLS url"),
  MERCHANT_ID: Joi.string().required().label("MERCHANT_ID required"),
  ACCESS_CODE: Joi.string().required().label("ACCESS_CODE required"),
  WORKING_KEY: Joi.string().required().label("WORKING_KEY required"),
  CC_AVENUE_VERIFY_PAYMENT_URL: Joi.string()
    .required()
    .label("CC_AVENUE_VERIFY_PAYMENT_URL required"),
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
  jwt_dealer_secret: envVars.JWT_DEALER_SECRET,
  jwt_dealer_secret_refresh: envVars.JWT_DEALER_SECRET_REFRESH,
  jwt_expires: envVars.JWT_EXPIRATION_MINUTES,
  jwt_delivery_boy_secret: envVars.JWT_DELIVERY_BOY_SECRET,
  jwt_secret_otp: envVars.JWT_SECRET_OTP,
  jwt_expires_otp: envVars.JWT_EXPIRATION_MINUTES_OTP,
  localhost: envVars.LOCALHOST,
  server_auth_key: envVars.SERVER_AUTH_KEY,
  dialer_domain: envVars.DIALER_DOMAIN,
  money_back_id: envVars.MONEY_BACK_ID,
  product_replacement_disposition: envVars.PRODUCT_REPLACEMENT_DISPOSITION,
  redFlags: envVars.RED_FLAG_DISPOSITION,
  otherRedFlagIc2: envVars.OTHER_RED_FLAG_IC2,
  otherRedFlagIc3: envVars.OTHER_RED_FLAG_IC3,
  orangeFlags: envVars.ORANGE_FLAG_DISPOSITION,
  otherOrangeFlags: envVars.OTHER_ORANGE_FLAG,
  houseArrestCaseDisposition: envVars.HOUSE_ARREST_CASE_DISPOSITION,
  base_url:
    envVars.NODE_ENV === "development"
      ? envVars.BASEURL_LOCAL + ":" + envVars.PORT + "/"
      : envVars.BASEURL_LIVE + "/",
  shipyaari_baseurl: envVars.SHIPYAARI_BASE_URL,
  shipyaari_email: envVars.SHIPYAARI_EMAIL,
  shipyaari_password: envVars.SHIPYAARI_PASSWORD,
  order_queue_url: envVars.ORDER_QUEUE_URL,
  tally_url: envVars.TALLY_BASEURL_LOCAL,
  redis: {
    tlsFlag: true, // Whether to use TLS for Redis
    url: envVars.REDIS_URL, // Redis URL (non-TLS)
    urlTls: envVars.REDIS_URL_TLS, // Redis URL with TLS
  },
  merchantId: envVars.MERCHANT_ID,
  accessCode: envVars.ACCESS_CODE,
  workingKey: envVars.WORKING_KEY,
  ccAvenueUrl: envVars.CC_AVENUE_VERIFY_PAYMENT_URL,
};
