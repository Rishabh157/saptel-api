const router = require("express").Router();
const districtController = require("./DistrictController");
const validate = require("../../middleware/validate");
const districtValidation = require("./DistrictValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
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
  authCheckMiddleware,
  validate(districtValidation.get),
  districtController.getStateDistrict
);

/**
 * get all district of a state without token
 */
router.get(
  "/get-state-district/unauth/:id",
  validate(districtValidation.get),
  districtController.getStateDistrict
);

/**
 * get all district by pincode without token
 */
router.get(
  "/get-district-by-pincode/unauth/:id",
  validate(districtValidation.getDistrictByPincode),
  districtController.getDistrictByPincode
);
/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(districtValidation.getDocument),
  districtController.getById
);
/**
 * get all district pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(districtValidation.getAllFilter),
  districtController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(districtValidation.create),
  districtController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(districtValidation.update),
  districtController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(districtValidation.changeStatus),
  districtController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(districtValidation.deleteDocument),
  districtController.deleteDocument
);

module.exports = router;
