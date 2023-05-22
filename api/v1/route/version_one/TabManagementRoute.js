const router = require("express").Router();
const tabManagementController = require("../../controller/tabManagement/TabManagementController");
const validate = require("../../middleware/validate");
const tabManagementValidation = require("../../validation/TabManagementValidation");
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
  validate(tabManagementValidation.get),
  tabManagementController.get
);
/**
 * get all tabManagement pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(tabManagementValidation.getAllFilter),
  tabManagementController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(tabManagementValidation.create),
  tabManagementController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(tabManagementValidation.update),
  tabManagementController.update
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(tabManagementValidation.changeStatus),
  tabManagementController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(tabManagementValidation.deleteDocument),
  tabManagementController.deleteDocument
);

module.exports = router;
