const router = require("express").Router();
const companyController = require("./CompanyController");
const validate = require("../../middleware/validate");
const companyValidation = require("./CompanyValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(companyValidation.get),
  companyController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(companyValidation.getDocument),
  companyController.getById
);
/**
 * get all company pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(companyValidation.getAllFilter),
  companyController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(companyValidation.create),
  companyController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(companyValidation.update),
  companyController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(companyValidation.changeStatus),
  companyController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(companyValidation.deleteDocument),
  companyController.deleteDocument
);

module.exports = router;
