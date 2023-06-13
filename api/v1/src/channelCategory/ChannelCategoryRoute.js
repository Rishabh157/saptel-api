const router = require("express").Router();
const channelCategoryController = require("./ChannelCategoryController");
const validate = require("../../middleware/validate");
const channelCategoryValidation = require("./ChannelCategoryValidation");
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
  validate(channelCategoryValidation.get),
  channelCategoryController.get
);
/**
 * get all channelCategory pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelCategoryValidation.getAllFilter),
  channelCategoryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelCategoryValidation.create),
  channelCategoryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelCategoryValidation.update),
  channelCategoryController.update
);
/**
 * get by id
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelCategoryValidation.getById),
  channelCategoryController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelCategoryValidation.changeStatus),
  channelCategoryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(channelCategoryValidation.deleteDocument),
  channelCategoryController.deleteDocument
);

module.exports = router;
