const router = require("express").Router();
const productGroupSummaryController = require("./ProductGroupSummaryController");
const validate = require("../../middleware/validate");
const productGroupSummaryValidation = require("./ProductGroupSummaryValidation");

const {
  authCheckMiddleware,
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

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

/**
 * get one document (if query) / all documents
 */
router.get(
  "/dealer/warehouseid/:wid",
  authCheckDealerMiddleware,
  validate(productGroupSummaryValidation.get),
  productGroupSummaryController.get
);
module.exports = router;
