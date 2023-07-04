const router = require("express").Router();
const ledgerController = require("./LedgerController");
const validate = require("../../middleware/validate");
const ledgerValidation = require("./LedgerValidation");
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
  validate(ledgerValidation.get),
  ledgerController.get
);
/**
 * get all ledger pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(ledgerValidation.getAllFilter),
  ledgerController.allFilterPagination
);

/**
 * get all ledger pagination filter dealer app
 */

router.post(
  "/dealer/ledger",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(ledgerValidation.getAllFilter),
  ledgerController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(ledgerValidation.create),
  ledgerController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(ledgerValidation.update),
  ledgerController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(ledgerValidation.getById),
  ledgerController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(ledgerValidation.changeStatus),
  ledgerController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(ledgerValidation.deleteDocument),
  ledgerController.deleteDocument
);

module.exports = router;
