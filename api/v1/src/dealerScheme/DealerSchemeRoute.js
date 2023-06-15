const router = require("express").Router();
const dealerSchemeController = require("./DealerSchemeController");
const validate = require("../../middleware/validate");
const dealerSchemeValidation = require("./DealerSchemeValidation");
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
  validate(dealerSchemeValidation.get),
  dealerSchemeController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerSchemeValidation.getDocument),
  dealerSchemeController.getById
);

/**
 * get one document (if query) / all documents
 */
router.get(
  "/get-all/:id",
  accessModuleCheck,
  authCheckMiddleware,
  // validate(dealerSchemeValidation.get),
  dealerSchemeController.getbydealerId
);

/**
 * get all dealerScheme pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerSchemeValidation.getAllFilter),
  dealerSchemeController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerSchemeValidation.create),
  dealerSchemeController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerSchemeValidation.update),
  dealerSchemeController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerSchemeValidation.changeStatus),
  dealerSchemeController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerSchemeValidation.deleteDocument),
  dealerSchemeController.deleteDocument
);

module.exports = router;
