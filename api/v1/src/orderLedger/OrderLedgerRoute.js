const router = require("express").Router();
const orderLedgerController = require("./OrderLedgerController");
const validate = require("../../middleware/validate");
const orderLedgerValidation = require("./OrderLedgerValidation");
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
  validate(orderLedgerValidation.get),
  orderLedgerController.get
);
/**
 * get all ledger pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(orderLedgerValidation.getAllFilter),
  orderLedgerController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(orderLedgerValidation.create),
  orderLedgerController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(orderLedgerValidation.update),
  orderLedgerController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(orderLedgerValidation.getById),
  orderLedgerController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(orderLedgerValidation.changeStatus),
  orderLedgerController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(orderLedgerValidation.deleteDocument),
  orderLedgerController.deleteDocument
);

module.exports = router;
