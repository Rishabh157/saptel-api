const router = require("express").Router();
const salesOrderController = require("../../controller/salesOrder/SalesOrderController");
const validate = require("../../middleware/validate");
const salesOrderValidation = require("../../validation/SalesOrderValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
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
  accessModuleCheck,
  authCheckMiddleware,
  validate(salesOrderValidation.get),
  salesOrderController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(salesOrderValidation.getDocument),
  salesOrderController.getById
);
/**
 * get by dealer id
 */
router.get(
  "/get-by-dealer/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(salesOrderValidation.getDocument),
  salesOrderController.getByDealerId
);
/**
 * get all salesOrder pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(salesOrderValidation.getAllFilter),
  salesOrderController.allFilterPagination
);

// dealer app inventory
router.post(
  "/list",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(salesOrderValidation.getAllFilter),
  salesOrderController.allFilterPagination
);
// update approval status
router.put(
  "/approval-level/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(salesOrderValidation.updateApproval),
  salesOrderController.updateLevel
);
/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(salesOrderValidation.create),
  salesOrderController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(salesOrderValidation.update),
  salesOrderController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(salesOrderValidation.changeStatus),
  salesOrderController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(salesOrderValidation.deleteDocument),
  salesOrderController.deleteDocument
);

module.exports = router;
