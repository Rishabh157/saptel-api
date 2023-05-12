const router = require("express").Router();
const dealerPincodeController = require("../../controller/dealerPincode/DealerPincodeController");
const validate = require("../../middleware/validate");
const dealerPincodeValidation = require("../../validation/DealerPincodeValidation");
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
  validate(dealerPincodeValidation.get),
  dealerPincodeController.get
);
/**
 * get all dealerPincode pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerPincodeValidation.getAllFilter),
  dealerPincodeController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerPincodeValidation.create),
  dealerPincodeController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerPincodeValidation.update),
  dealerPincodeController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerPincodeValidation.changeStatus),
  dealerPincodeController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerPincodeValidation.deleteDocument),
  dealerPincodeController.deleteDocument
);

module.exports = router;
