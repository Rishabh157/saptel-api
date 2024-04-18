const router = require("express").Router();
const vendorController = require("./VendorController");
const validate = require("../../middleware/validate");
const vendorValidation = require("./VendorValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(vendorValidation.get),
  vendorController.get
);
/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(vendorValidation.getDocument),
  vendorController.getById
);
/**
 * get all vendor pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(vendorValidation.getAllFilter),
  vendorController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(vendorValidation.create),
  vendorController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(vendorValidation.update),
  vendorController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(vendorValidation.changeStatus),
  vendorController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(vendorValidation.deleteDocument),
  vendorController.deleteDocument
);

module.exports = router;
