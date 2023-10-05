const router = require("express").Router();
const barCodeController = require("./BarCodeFlowController");
const validate = require("../../middleware/validate");
const barCodeValidation = require("./BarCodeFlowValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(barCodeValidation.get),
  barCodeController.get
);

/**
 * get one document
 */
router.get(
  "/:barcode",
  authCheckMiddleware,
  validate(barCodeValidation.getDocument),
  barCodeController.getById
);
/**
 * get all barCode pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(barCodeValidation.getAllFilter),
  barCodeController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(barCodeValidation.create),
  barCodeController.add
);

module.exports = router;
