const router = require("express").Router();
const featureController = require("../../controller/feature/FeatureController");
const validate = require("../../middleware/validate");
const featureValidation = require("./FeatureValidation");
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
  validate(featureValidation.get),
  featureController.get
);

/**
 * get all feature pagination filter
 */

router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(featureValidation.getDocument),
  featureController.getById
);

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(featureValidation.getAllFilter),
  featureController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  //   accessModuleCheck,
  authCheckMiddleware,
  validate(featureValidation.create),
  featureController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(featureValidation.update),
  featureController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(featureValidation.changeStatus),
  featureController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(featureValidation.deleteDocument),
  featureController.deleteDocument
);

module.exports = router;
