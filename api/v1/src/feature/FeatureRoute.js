const router = require("express").Router();
const featureController = require("./FeatureController");
const validate = require("../../middleware/validate");
const featureValidation = require("./FeatureValidation");
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
  validate(featureValidation.get),
  featureController.get
);

/**
 * get all feature pagination filter
 */

router.get(
  "/:id",
  authCheckMiddleware,
  validate(featureValidation.getDocument),
  featureController.getById
);

router.post(
  "/",
  authCheckMiddleware,
  validate(featureValidation.getAllFilter),
  featureController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(featureValidation.create),
  featureController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(featureValidation.update),
  featureController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(featureValidation.changeStatus),
  featureController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(featureValidation.deleteDocument),
  featureController.deleteDocument
);

module.exports = router;
