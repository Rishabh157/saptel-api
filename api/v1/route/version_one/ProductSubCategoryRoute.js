const router = require("express").Router();
const productSubCategoryController = require("../../controller/productSubCategory/ProductSubCategoryController");
const validate = require("../../middleware/validate");
const productSubCategoryValidation = require("../../validation/ProductSubCategoryValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productSubCategoryValidation.get),
  productSubCategoryController.get
);

/**
 * get all by parent category
 */
router.get(
  "/get-by-parent-category/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productSubCategoryValidation.getDocument),
  productSubCategoryController.getByParentCategory
);
/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productSubCategoryValidation.getDocument),
  productSubCategoryController.getById
);
/**
 * get all productSubCategory pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productSubCategoryValidation.getAllFilter),
  productSubCategoryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productSubCategoryValidation.create),
  productSubCategoryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productSubCategoryValidation.update),
  productSubCategoryController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productSubCategoryValidation.changeStatus),
  productSubCategoryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productSubCategoryValidation.deleteDocument),
  productSubCategoryController.deleteDocument
);

module.exports = router;
