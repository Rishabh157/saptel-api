const router = require("express").Router();
const channelMasterController = require("./ChannelMasterController");
const validate = require("../../middleware/validate");
const channelMasterValidation = require("./ChannelMasterValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(channelMasterValidation.get),
  channelMasterController.get
);
/**
 * get all channelMaster pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(channelMasterValidation.getAllFilter),
  channelMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(channelMasterValidation.create),
  channelMasterController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(channelMasterValidation.update),
  channelMasterController.update
);

/**
 * get by id document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(channelMasterValidation.getById),
  channelMasterController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(channelMasterValidation.changeStatus),
  channelMasterController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(channelMasterValidation.deleteDocument),
  channelMasterController.deleteDocument
);

module.exports = router;
