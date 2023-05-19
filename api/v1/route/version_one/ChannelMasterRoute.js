const router = require("express").Router();
const channelMasterController = require("../../controller/channelMaster/ChannelMasterController");
const validate = require("../../middleware/validate");
const channelMasterValidation = require("../../validation/ChannelMasterValidation");
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
  validate(channelMasterValidation.get),
  channelMasterController.get
);
/**
 * get all channelMaster pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelMasterValidation.getAllFilter),
  channelMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelMasterValidation.create),
  channelMasterController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelMasterValidation.update),
  channelMasterController.update
);

/**
 * get by id document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelMasterValidation.getById),
  channelMasterController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelMasterValidation.changeStatus),
  channelMasterController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelMasterValidation.deleteDocument),
  channelMasterController.deleteDocument
);

module.exports = router;
