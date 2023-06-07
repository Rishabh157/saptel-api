const router = require("express").Router();
const productGroupController = require("../../controller/productGroup/ProductGroupController");
const validate = require("../../middleware/validate");
const productGroupValidation = require("../../validation/ProductGroupValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productGroupValidation.get),
  productGroupController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productGroupValidation.getDocument),
  productGroupController.getById
);
/**
 * get all productGroup pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productGroupValidation.getAllFilter),
  productGroupController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productGroupValidation.create),
  productGroupController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productGroupValidation.update),
  productGroupController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productGroupValidation.changeStatus),
  productGroupController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(productGroupValidation.deleteDocument),
  productGroupController.deleteDocument
);

module.exports = router;
