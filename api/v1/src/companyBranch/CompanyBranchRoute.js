const router = require("express").Router();
const companyBranchController = require("./CompanyBranchController");
const validate = require("../../middleware/validate");
const companyBranchValidation = require("./CompanyBranchValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(companyBranchValidation.get),
  companyBranchController.get
);
/**
 * get all companyBranch pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(companyBranchValidation.getAllFilter),
  companyBranchController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(companyBranchValidation.create),
  companyBranchController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(companyBranchValidation.update),
  companyBranchController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(companyBranchValidation.getById),
  companyBranchController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(companyBranchValidation.changeStatus),
  companyBranchController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(companyBranchValidation.deleteDocument),
  companyBranchController.deleteDocument
);

module.exports = router;
