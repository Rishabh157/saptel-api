const router = require("express").Router();
const pincodeController = require("./PincodeController");
const validate = require("../../middleware/validate");
const pincodeValidation = require("./PincodeValidation");
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
  validate(pincodeValidation.get),
  pincodeController.get
);

/**
 * get all documents without token
 */
router.get("/inbound", validate(pincodeValidation.get), pincodeController.get);
/**
 * get all pincodes of a country
 */
router.get(
  "/get-country-pincode/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.get),
  pincodeController.getPincodeByCountry
);

/**
 * get all pincodes of a country without token
 */
router.get(
  "/get-country-pincode/inbound/:id",
  validate(pincodeValidation.get),
  pincodeController.getPincodeByCountry
);

/**
 * get all pincodes of a district
 */
router.get(
  "/get-district-pincode/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.get),
  pincodeController.getPincodeByDistrict
);
/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.getDocument),
  pincodeController.getById
);
/**
 * get all pincode pagination filter
 */

router.post(
  "/",
  // accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.getAllFilter),
  pincodeController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  // accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.create),
  pincodeController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.update),
  pincodeController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.changeStatus),
  pincodeController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(pincodeValidation.deleteDocument),
  pincodeController.deleteDocument
);

module.exports = router;
