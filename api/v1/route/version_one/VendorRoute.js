const router = require("express").Router();
const vendorController = require("../../controller/vendor/VendorController");
const validate = require("../../middleware/validate");
const vendorValidation = require("../../validation/VendorValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(vendorValidation.get),
  vendorController.get
);
/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(vendorValidation.getDocument),
  vendorController.getById
);
/**
 * get all vendor pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(vendorValidation.getAllFilter),
  vendorController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(vendorValidation.create),
  vendorController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(vendorValidation.update),
  vendorController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(vendorValidation.changeStatus),
  vendorController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(vendorValidation.deleteDocument),
  vendorController.deleteDocument
);

module.exports = router;
