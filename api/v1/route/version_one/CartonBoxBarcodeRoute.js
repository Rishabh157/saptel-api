const router = require("express").Router();
const cartonBoxBarcodeController = require("../../controller/cartonBoxBarcode/CartonBoxBarcodeController");
const validate = require("../../middleware/validate");
const cartonBoxBarcodeValidation = require("../../validation/CartonBoxBarcodeValidation");
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
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxBarcodeValidation.get),
  cartonBoxBarcodeController.get
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
