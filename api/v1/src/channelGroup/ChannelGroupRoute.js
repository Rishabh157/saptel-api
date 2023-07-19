const router = require("express").Router();
const channelGroupController = require("./ChannelGroupController");
const validate = require("../../middleware/validate");
const channelGroupValidation = require("./ChannelGroupValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(channelGroupValidation.get),
  channelGroupController.get
);
/**
 * get all channelGroup pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(channelGroupValidation.getAllFilter),
  channelGroupController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(channelGroupValidation.create),
  channelGroupController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(channelGroupValidation.update),
  channelGroupController.update
);

/**
 * get single document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(channelGroupValidation.getById),
  channelGroupController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(channelGroupValidation.changeStatus),
  channelGroupController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(channelGroupValidation.deleteDocument),
  channelGroupController.deleteDocument
);

module.exports = router;
