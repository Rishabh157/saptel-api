const router = require("express").Router();
const salesOrderController = require("../../controller/salesOrder/SalesOrderController");
const validate = require("../../middleware/validate");
const salesOrderValidation = require("../../validation/SalesOrderValidation");
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
  "/",
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
 * get all salesOrder pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(salesOrderValidation.getAllFilter),
  salesOrderController.allFilterPagination
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
