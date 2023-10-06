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
  "/:id",
  authCheckMiddleware,
  validate(salesOrderValidation.getDocument),
  salesOrderController.getById
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
  "/list",
  authCheckDealerMiddleware,
  validate(salesOrderValidation.getAllFilter),
  salesOrderController.allFilterPagination
);
// update approval status
router.put(
  "/approval-level/:id",
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
  "/:id",
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
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(salesOrderValidation.deleteDocument),
  salesOrderController.deleteDocument
);

module.exports = router;
