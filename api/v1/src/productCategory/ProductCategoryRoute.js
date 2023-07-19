const router = require("express").Router();
const productCategoryController = require("./ProductCategoryController");
const validate = require("../../middleware/validate");
const productCategoryValidation = require("./ProductCategoryValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(productCategoryValidation.get),
  productCategoryController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(productCategoryValidation.getDocument),
  productCategoryController.getById
);
/**
 * get all productCategory pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(productCategoryValidation.getAllFilter),
  productCategoryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(productCategoryValidation.create),
  productCategoryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(productCategoryValidation.update),
  productCategoryController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(productCategoryValidation.changeStatus),
  productCategoryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(productCategoryValidation.deleteDocument),
  productCategoryController.deleteDocument
);

module.exports = router;
