const router = require("express").Router();
const houseArrestRequestLogsController = require("./HouseArrestRequestLogsController");
const validate = require("../../middleware/validate");
const houseArrestRequestLogsValidation = require("./HouseArrestRequestLogsValidation");

const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/get-logs/:harId",
  authCheckMiddleware,
  validate(houseArrestRequestLogsValidation.get),
  houseArrestRequestLogsController.get
);

module.exports = router;
