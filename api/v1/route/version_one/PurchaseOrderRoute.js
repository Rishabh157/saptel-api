const router = require("express").Router();
const purchaseOrderController = require("../../controller/purchaseOrder/PurchaseOrderController");
const validate = require("../../middleware/validate");
const purchaseOrderValidation = require("../../validation/PurchaseOrderValidation");
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
  validate(purchaseOrderValidation.get),
  purchaseOrderController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(purchaseOrderValidation.getDocument),
  purchaseOrderController.getById
);
/**
 * get all purchaseOrder pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(purchaseOrderValidation.getAllFilter),
  purchaseOrderController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(purchaseOrderValidation.create),
  purchaseOrderController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(purchaseOrderValidation.update),
  purchaseOrderController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(purchaseOrderValidation.changeStatus),
  purchaseOrderController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(purchaseOrderValidation.deleteDocument),
  purchaseOrderController.deleteDocument
);

module.exports = router;
