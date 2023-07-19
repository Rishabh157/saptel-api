const router = require("express").Router();
const assetCategoryController = require("./AssetsCategoryController");
const validate = require("../../middleware/validate");
const assetCategoryValidation = require("./AssetCategoryValidation");
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
  validate(assetCategoryValidation.get),
  assetCategoryController.get
);
/**
 * get all assetCategory pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(assetCategoryValidation.getAllFilter),
  assetCategoryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(assetCategoryValidation.create),
  assetCategoryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(assetCategoryValidation.update),
  assetCategoryController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(assetCategoryValidation.getById),
  assetCategoryController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(assetCategoryValidation.changeStatus),
  assetCategoryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(assetCategoryValidation.deleteDocument),
  assetCategoryController.deleteDocument
);

module.exports = router;
