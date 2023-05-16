const router = require("express").Router();
const didManagementController = require("../../controller/didManagement/DidManagementController");
const validate = require("../../middleware/validate");
const didManagementValidation = require("../../validation/DidManagementValidation");
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
  validate(didManagementValidation.get),
  didManagementController.get
);
/**
 * get all didManagement pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(didManagementValidation.getAllFilter),
  didManagementController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(didManagementValidation.create),
  didManagementController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(didManagementValidation.update),
  didManagementController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(didManagementValidation.changeStatus),
  didManagementController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(didManagementValidation.deleteDocument),
  didManagementController.deleteDocument
);

module.exports = router;
