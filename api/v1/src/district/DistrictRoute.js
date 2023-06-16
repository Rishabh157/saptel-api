const router = require("express").Router();
const districtController = require("./DistrictController");
const validate = require("../../middleware/validate");
const districtValidation = require("./DistrictValidation");
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
  validate(districtValidation.get),
  districtController.get
);

/**
 * get all documents without token
 */
router.get(
  "/inbound",
  validate(districtValidation.get),
  districtController.get
);
/**
 * get all district of a state
 */
router.get(
  "/get-state-district/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.get),
  districtController.getStateDistrict
);

/**
 * get all district of a state without token
 */
router.get(
  "/get-state-district/inbound/:id",

  validate(districtValidation.get),
  districtController.getStateDistrict
);
/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.getDocument),
  districtController.getById
);
/**
 * get all district pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.getAllFilter),
  districtController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  // accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.create),
  districtController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.update),
  districtController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.changeStatus),
  districtController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.deleteDocument),
  districtController.deleteDocument
);

module.exports = router;