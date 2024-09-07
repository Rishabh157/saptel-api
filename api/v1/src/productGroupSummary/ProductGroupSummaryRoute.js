const router = require("express").Router();
const productGroupSummaryController = require("./ProductGroupSummaryController");
const validate = require("../../middleware/validate");
const productGroupSummaryValidation = require("./ProductGroupSummaryValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/warehouseid/:wid",
  authCheckMiddleware,
  validate(productGroupSummaryValidation.get),
  productGroupSummaryController.get
);

module.exports = router;
