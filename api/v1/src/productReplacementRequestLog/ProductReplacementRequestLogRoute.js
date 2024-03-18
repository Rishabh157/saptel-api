const router = require("express").Router();
const productReplacementRequestLogController = require("./ProductReplacementRequestLogController");
const validate = require("../../middleware/validate");
const productReplacementRequestLogValidation = require("./ProductReplacementRequestLogValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/get-logs/:productReplacementRequestId",
  authCheckMiddleware,
  validate(productReplacementRequestLogValidation.get),
  productReplacementRequestLogController.get
);

module.exports = router;
