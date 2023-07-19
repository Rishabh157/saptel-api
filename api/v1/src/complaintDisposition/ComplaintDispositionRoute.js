const router = require("express").Router();
const complaintDispositionController = require("./ComplaintDispositionController");
const complaintDispositionValidation = require("./ComplaintDispositionValidation");
const validate = require("../../middleware/validate");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(complaintDispositionValidation.get),
  complaintDispositionController.get
);

//===============get document by id===============
router.get(
  "/:id",
  authCheckMiddleware,
  validate(complaintDispositionValidation.getByDispositionOneId),
  complaintDispositionController.getById
);

//===============get all pagination filter===============
router.post(
  "/",
  authCheckMiddleware,
  validate(complaintDispositionValidation.getAllFilter),
  complaintDispositionController.getFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  authCheckMiddleware,
  validate(complaintDispositionValidation.create),
  complaintDispositionController.add
);

//===============update document===============
router.put(
  "/:id",
  authCheckMiddleware,
  validate(complaintDispositionValidation.update),
  complaintDispositionController.update
);

//===============delete document===============
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(complaintDispositionValidation.deleteDocument),
  complaintDispositionController.deleteDocument
);

module.exports = router;
