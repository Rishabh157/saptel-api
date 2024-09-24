const router = require("express").Router();
const productSubCategoryController = require("./ProductSubCategoryController");
const validate = require("../../middleware/validate");
const productSubCategoryValidation = require("./ProductSubCategoryValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(productSubCategoryValidation.get),
  productSubCategoryController.get
);

/**
 * get all by parent category
 */
router.get(
  "/get-by-parent-category/:id",
  authCheckMiddleware,
  validate(productSubCategoryValidation.getDocument),
  productSubCategoryController.getByParentCategory
);
/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(productSubCategoryValidation.getDocument),
  productSubCategoryController.getById
);
/**
 * get all productSubCategory pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(productSubCategoryValidation.getAllFilter),
  productSubCategoryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(productSubCategoryValidation.create),
  productSubCategoryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(productSubCategoryValidation.update),
  productSubCategoryController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(productSubCategoryValidation.changeStatus),
  productSubCategoryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(productSubCategoryValidation.deleteDocument),
  productSubCategoryController.deleteDocument
);

module.exports = router;
