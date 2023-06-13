const router = require("express").Router();
const dealerController = require("./DealerController");
const validate = require("../../middleware/validate");
const dealerValidation = require("./DealerValidation");
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
  validate(dealerValidation.get),
  dealerController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerValidation.getDocument),
  dealerController.getById
);
/**
 * get all dealer pagination filter
 */
/**
 * login dealer
 */
router.post(
  "/login",
  // accessModuleCheck,
  validate(dealerValidation.loginValid),
  dealerController.login
);
router.post(
  "/refresh",
  // accessModuleCheck,
  validate(dealerValidation.refreshTokenValid),
  dealerController.refreshToken
);
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerValidation.getAllFilter),
  dealerController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerValidation.create),
  dealerController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerValidation.update),
  dealerController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerValidation.changeStatus),
  dealerController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealerValidation.deleteDocument),
  dealerController.deleteDocument
);

module.exports = router;
