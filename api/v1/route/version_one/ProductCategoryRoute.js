const router = require("express").Router();
const productCategoryController = require("../../controller/productCategory/ProductCategoryController");
const validate = require("../../middleware/validate");
const productCategoryValidation = require("../../validation/ProductCategoryValidation");
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
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productCategoryValidation.get),
  productCategoryController.get
);
/**
 * get all productCategory pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productCategoryValidation.getAllFilter),
  productCategoryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productCategoryValidation.create),
  productCategoryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productCategoryValidation.update),
  productCategoryController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productCategoryValidation.changeStatus),
  productCategoryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productCategoryValidation.deleteDocument),
  productCategoryController.deleteDocument
);

module.exports = router;
