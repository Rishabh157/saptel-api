const router = require("express").Router();
const salesOrderController = require("./SalesOrderController");
const validate = require("../../middleware/validate");
const salesOrderValidation = require("./SalesOrderValidation");
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
  validate(salesOrderValidation.get),
  salesOrderController.get
);

/**
 * get one document
 */
router.get(
  "/:sonumber",
  authCheckMiddleware,
  validate(salesOrderValidation.getDocument),
  salesOrderController.getById
);

/**
 * get one document for invoice
 */
router.get(
  "/get-dealer-invoice/:sonumber",
  authCheckMiddleware,
  validate(salesOrderValidation.getDocument),
  salesOrderController.getDealerInvoice
);

/**
 * get by dealer id
 */
router.get(
  "/get-by-dealer/:id",
  authCheckMiddleware,
  validate(salesOrderValidation.getDocument),
  salesOrderController.getByDealerId
);
/**
 * get all salesOrder pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(salesOrderValidation.getAllFilter),
  salesOrderController.allFilterPagination
);

router.post(
  "/groupby",
  authCheckMiddleware,
  validate(salesOrderValidation.getAllFilter),
  salesOrderController.allFilterGroupPagination
);

// dealer app inventory
router.post(
  "/dealer-po",
  authCheckDealerMiddleware,
  validate(salesOrderValidation.getAllFilter),
  salesOrderController.allFilterGroupPaginationForDealer
);
// update approval status
router.put(
  "/approval-level/:sonumber",
  authCheckMiddleware,
  validate(salesOrderValidation.updateApproval),
  salesOrderController.updateLevel
);
/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(salesOrderValidation.create),
  salesOrderController.add
);
/**
 * update document
 */
router.put(
  "/update-so",
  authCheckMiddleware,
  validate(salesOrderValidation.update),
  salesOrderController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(salesOrderValidation.changeStatus),
  salesOrderController.statusChange
);

/**
 * update so status
 */
router.put(
  "/update-so/:id/status/:status",
  authCheckMiddleware,
  validate(salesOrderValidation.updateSoStatus),
  salesOrderController.updateSoStatus
);
/**
 * delete document
 */
router.delete(
  "/:sonumber",
  authCheckMiddleware,
  validate(salesOrderValidation.deleteDocument),
  salesOrderController.deleteDocument
);

module.exports = router;
