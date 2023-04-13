const router = require("express").Router();
const countryController = require("../../controller/country/CountryController");
const validate = require("../../middleware/validate");
const countryValidation = require("../../validation/CountryValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  accessModuleCheck,
  // authCheckMiddleware,
  validate(countryValidation.get),
  countryController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(countryValidation.getDocument),
  countryController.getById
);
/**
 * get all country pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  // authCheckMiddleware,
  validate(countryValidation.getAllFilter),
  countryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(countryValidation.create),
  countryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(countryValidation.update),
  countryController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(countryValidation.changeStatus),
  countryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(countryValidation.deleteDocument),
  countryController.deleteDocument
);

module.exports = router;
