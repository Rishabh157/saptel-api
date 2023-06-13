const router = require("express").Router();
const complaintDispositionController = require("./ComplaintDispositionController");
const complaintDispositionValidation = require("./ComplaintDispositionValidation");
const validate = require("../../middleware/validate");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(complaintDispositionValidation.get),
  complaintDispositionController.get
);

//===============get document by id===============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(complaintDispositionValidation.getByDispositionOneId),
  complaintDispositionController.getById
);

//===============get all pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(complaintDispositionValidation.getAllFilter),
  complaintDispositionController.getFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(complaintDispositionValidation.create),
  complaintDispositionController.add
);

//===============update document===============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(complaintDispositionValidation.update),
  complaintDispositionController.update
);

//===============delete document===============
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(complaintDispositionValidation.deleteDocument),
  complaintDispositionController.deleteDocument
);

module.exports = router;
