const router = require("express").Router();
const channelCategoryController = require("./ChannelCategoryController");
const validate = require("../../middleware/validate");
const channelCategoryValidation = require("./ChannelCategoryValidation");
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
  authCheckMiddleware,
  validate(channelCategoryValidation.get),
  channelCategoryController.get
);
/**
 * get all channelCategory pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(channelCategoryValidation.getAllFilter),
  channelCategoryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(channelCategoryValidation.create),
  channelCategoryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(channelCategoryValidation.update),
  channelCategoryController.update
);
/**
 * get by id
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(channelCategoryValidation.getById),
  channelCategoryController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(channelCategoryValidation.changeStatus),
  channelCategoryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(channelCategoryValidation.deleteDocument),
  channelCategoryController.deleteDocument
);

module.exports = router;
