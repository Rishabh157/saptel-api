const router = require("express").Router();
const orderLedgerController = require("./OrderLedgerController");
const validate = require("../../middleware/validate");
const orderLedgerValidation = require("./OrderLedgerValidation");
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
  authCheckMiddleware,
  validate(orderLedgerValidation.get),
  orderLedgerController.get
);
/**
 * get all ledger pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(orderLedgerValidation.getAllFilter),
  orderLedgerController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(orderLedgerValidation.create),
  orderLedgerController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(orderLedgerValidation.update),
  orderLedgerController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(orderLedgerValidation.getById),
  orderLedgerController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(orderLedgerValidation.changeStatus),
  orderLedgerController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(orderLedgerValidation.deleteDocument),
  orderLedgerController.deleteDocument
);

module.exports = router;
