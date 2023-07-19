const router = require("express").Router();
const productController = require("./ProductController");
const validate = require("../../middleware/validate");
const productValidation = require("./ProductValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(productValidation.get),
  productController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(productValidation.getDocument),
  productController.getById
);
/**
 * get all product pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(productValidation.getAllFilter),
  productController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(productValidation.create),
  productController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(productValidation.update),
  productController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(productValidation.changeStatus),
  productController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(productValidation.deleteDocument),
  productController.deleteDocument
);

module.exports = router;
