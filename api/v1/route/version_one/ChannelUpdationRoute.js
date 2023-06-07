const router = require("express").Router();
const channelUpdationController = require("../../controller/channelUpdation/ChannelUpdationController");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");
const validate = require("../../middleware/validate");
const channelUpdationValidation = require("../../validation/ChannelUpdationValidation");

//===============get one document (if query) / all document===============
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelUpdationValidation.get),
  channelUpdationController.get
);

//===============get all dispositionOne pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelUpdationValidation.getAllFilter),
  channelUpdationController.getFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelUpdationValidation.create),
  channelUpdationController.add
);

//===============update document===============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelUpdationValidation.update),
  channelUpdationController.update
);

//===============delete document===============
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelUpdationValidation.deleteDocument),
  channelUpdationController.deleteDocument
);

module.exports = router;
