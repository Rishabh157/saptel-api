const router = require("express").Router();
const purchaseOrderController = require("./PurchaseOrderController");
const validate = require("../../middleware/validate");
const purchaseOrderValidation = require("./PurchaseOrderValidation");
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
  validate(purchaseOrderValidation.get),
  purchaseOrderController.get
);
// get by pocode
router.get(
  "/get-by-po/:pocode",
  authCheckMiddleware,
  validate(purchaseOrderValidation.get),
  purchaseOrderController.getByPoCode
);
// get by vendor id
router.get(
  "/get-by-vendor/:id",
  authCheckMiddleware,
  validate(purchaseOrderValidation.getDocument),
  purchaseOrderController.getByVendorId
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(purchaseOrderValidation.getDocument),
  purchaseOrderController.getById
);
/**
 * get all purchaseOrder pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(purchaseOrderValidation.getAllFilter),
  purchaseOrderController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(purchaseOrderValidation.create),
  purchaseOrderController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(purchaseOrderValidation.update),
  purchaseOrderController.update
);

// update approval status
router.put(
  "/approval-level/:id",
  authCheckMiddleware,
  validate(purchaseOrderValidation.updateApproval),
  purchaseOrderController.updateLevel
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(purchaseOrderValidation.changeStatus),
  purchaseOrderController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(purchaseOrderValidation.deleteDocument),
  purchaseOrderController.deleteDocument
);

module.exports = router;
