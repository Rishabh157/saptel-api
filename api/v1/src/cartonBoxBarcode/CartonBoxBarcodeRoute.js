const router = require("express").Router();
const cartonBoxBarcodeController = require("./CartonBoxBarcodeController");
const validate = require("../../middleware/validate");
const cartonBoxBarcodeValidation = require("./CartonBoxBarcodeValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxBarcodeValidation.get),
  cartonBoxBarcodeController.get
);

/**
 * get one document (if query) / all documents
 */
router.get(
  "/get-by-box/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxBarcodeValidation.getByboxId),
  cartonBoxBarcodeController.getByBoxId
);
/**
 * get all cartonBoxBarcode pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxBarcodeValidation.getAllFilter),
  cartonBoxBarcodeController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxBarcodeValidation.create),
  cartonBoxBarcodeController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxBarcodeValidation.update),
  cartonBoxBarcodeController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxBarcodeValidation.changeStatus),
  cartonBoxBarcodeController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxBarcodeValidation.deleteDocument),
  cartonBoxBarcodeController.deleteDocument
);

module.exports = router;
