const router = require("express").Router();
const channelManagementController = require("../../controller/channelManagement/ChannelManagementController");
const validate = require("../../middleware/validate");
const channelManagementValidation = require("../../validation/ChannelManagementValidation");
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
  validate(channelManagementValidation.get),
  channelManagementController.get
);
/**
 * get all channelManagement pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelManagementValidation.getAllFilter),
  channelManagementController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelManagementValidation.create),
  channelManagementController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelManagementValidation.update),
  channelManagementController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelManagementValidation.changeStatus),
  channelManagementController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelManagementValidation.deleteDocument),
  channelManagementController.deleteDocument
);

module.exports = router;
