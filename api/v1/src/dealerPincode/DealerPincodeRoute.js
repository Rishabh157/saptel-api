const router = require("express").Router();
const dealerPincodeController = require("./DealerPincodeController");
const validate = require("../../middleware/validate");
const dealerPincodeValidation = require("./DealerPincodeValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerPincodeValidation.get),
  dealerPincodeController.get
);

/**
 * get all document of a single dealer
 */
router.get(
  "/dealer/:dealerid/company/:companyid/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerPincodeValidation.getDealerData),
  dealerPincodeController.getDealerPincode
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
