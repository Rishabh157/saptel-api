const router = require("express").Router();
const channelUpdationController = require("./ChannelUpdationController");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");
const validate = require("../../middleware/validate");
const channelUpdationValidation = require("./ChannelUpdationValidation");

//===============get one document (if query) / all document===============
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(channelUpdationValidation.get),
  channelUpdationController.get
);

//===============get all dispositionOne pagination filter===============
router.post(
  "/",
  authCheckMiddleware,
  validate(channelUpdationValidation.getAllFilter),
  channelUpdationController.getFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  authCheckMiddleware,
  validate(channelUpdationValidation.create),
  channelUpdationController.add
);

//===============update document===============
router.put(
  "/:id",
  authCheckMiddleware,
  validate(channelUpdationValidation.update),
  channelUpdationController.update
);

//===============delete document===============
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(channelUpdationValidation.deleteDocument),
  channelUpdationController.deleteDocument
);

module.exports = router;
