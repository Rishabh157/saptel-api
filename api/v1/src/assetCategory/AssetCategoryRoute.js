const router = require("express").Router();
const assetCategoryController = require("./AssetsCategoryController");
const validate = require("../../middleware/validate");
const assetCategoryValidation = require("./AssetCategoryValidation");
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
  validate(assetCategoryValidation.get),
  assetCategoryController.get
);
/**
 * get all assetCategory pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetCategoryValidation.getAllFilter),
  assetCategoryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetCategoryValidation.create),
  assetCategoryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetCategoryValidation.update),
  assetCategoryController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetCategoryValidation.getById),
  assetCategoryController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetCategoryValidation.changeStatus),
  assetCategoryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetCategoryValidation.deleteDocument),
  assetCategoryController.deleteDocument
);

module.exports = router;
