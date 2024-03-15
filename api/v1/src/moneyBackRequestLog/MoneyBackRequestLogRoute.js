const router = require("express").Router();
const moneyBackRequestLogController = require("./MoneyBackRequestLogController");
const validate = require("../../middleware/validate");
const moneyBackRequestLogValidation = require("./MoneyBackRequestLogValidation");

const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(moneyBackRequestLogValidation.get),
  moneyBackRequestLogController.get
);

module.exports = router;
