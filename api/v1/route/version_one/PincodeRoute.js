const router = require("express").Router();
const pincodeController = require("../../controller/pincode/PincodeController");
const validate = require("../../middleware/validate");
const pincodeValidation = require("../../validation/PincodeValidation");
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
  validate(pincodeValidation.get),
  pincodeController.get
);
/**
 * get all pincode pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.getAllFilter),
  pincodeController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.create),
  pincodeController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.update),
  pincodeController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.changeStatus),
  pincodeController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.deleteDocument),
  pincodeController.deleteDocument
);

module.exports = router;
