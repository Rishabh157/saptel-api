const router = require("express").Router();
const channelGroupController = require("../../controller/channelGroup/ChannelGroupController");
const validate = require("../../middleware/validate");
const channelGroupValidation = require("../../validation/ChannelGroupValidation");
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
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelGroupValidation.get),
  channelGroupController.get
);
/**
 * get all channelGroup pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelGroupValidation.getAllFilter),
  channelGroupController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelGroupValidation.create),
  channelGroupController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelGroupValidation.update),
  channelGroupController.update
);

/**
 * get single document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelGroupValidation.getById),
  channelGroupController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelGroupValidation.changeStatus),
  channelGroupController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelGroupValidation.deleteDocument),
  channelGroupController.deleteDocument
);

module.exports = router;
