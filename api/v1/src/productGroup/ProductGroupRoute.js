const router = require("express").Router();
const productGroupController = require("./ProductGroupController");
const validate = require("../../middleware/validate");
const productGroupValidation = require("./ProductGroupValidation");
const {
  authCheckMiddleware,
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(productGroupValidation.get),
  productGroupController.get
);

router.get(
  "/dealer/get-all-product-group",
  authCheckDealerMiddleware,
  validate(productGroupValidation.get),
  productGroupController.getForDealer
);

/**
 * get one document unauth
 */
router.get(
  "/company/:companyid/unauth/all-product-group",
  validate(productGroupValidation.get),
  productGroupController.getUnauth
);
/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(productGroupValidation.getDocument),
  productGroupController.getById
);
/**
 * get all productGroup pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(productGroupValidation.getAllFilter),
  productGroupController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(productGroupValidation.create),
  productGroupController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(productGroupValidation.update),
  productGroupController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(productGroupValidation.changeStatus),
  productGroupController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(productGroupValidation.deleteDocument),
  productGroupController.deleteDocument
);

module.exports = router;
