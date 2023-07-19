const router = require("express").Router();
const ledgerController = require("./VendorLedgerController");
const validate = require("../../middleware/validate");
const ledgerValidation = require("./VendorLedgerValidation");
const {
  authCheckMiddleware,
  otpVerifyToken,
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(ledgerValidation.get),
  ledgerController.get
);
/**
 * get all ledger pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(ledgerValidation.getAllFilter),
  ledgerController.allFilterPagination
);

/**
 * get all ledger pagination filter dealer app
 */

router.post(
  "/dealer/ledger",
  authCheckDealerMiddleware,
  validate(ledgerValidation.getAllFilter),
  ledgerController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(ledgerValidation.create),
  ledgerController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(ledgerValidation.update),
  ledgerController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(ledgerValidation.getById),
  ledgerController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(ledgerValidation.changeStatus),
  ledgerController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(ledgerValidation.deleteDocument),
  ledgerController.deleteDocument
);

module.exports = router;
