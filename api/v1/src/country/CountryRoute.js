const router = require("express").Router();
const countryController = require("./CountryController");
const validate = require("../../middleware/validate");
const countryValidation = require("./CountryValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(countryValidation.get),
  countryController.get
);

/**
 * get all documents without token
 */
router.get("/inbound", validate(countryValidation.get), countryController.get);
/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(countryValidation.getDocument),
  countryController.getById
);
/**
 * get all country pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(countryValidation.getAllFilter),
  countryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(countryValidation.create),
  countryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(countryValidation.update),
  countryController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(countryValidation.changeStatus),
  countryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(countryValidation.deleteDocument),
  countryController.deleteDocument
);

module.exports = router;
