const router = require("express").Router();
const competitorController = require("../../controller/competitor/CompetitorController");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");
const validate = require("../../middleware/validate");

const competitorValidation = require("../../validation/CompetitorValidation");

// ===============get new document==============
router.get(
  "/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(competitorValidation.get),
  competitorController.get
);
// ------------------------

// ===============get document By Id document==============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(competitorValidation.getById),
  competitorController.getById
);
// ------------------------

// ===============get all artist by pagination filter document==============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(competitorValidation.getAllFilter),
  competitorController.allFilterPagination
);
// ----------------------------

// ===============create new document==============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(competitorValidation.create),
  competitorController.add
);
// ----------------------------

// ===============update existing document==============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(competitorValidation.update),
  competitorController.update
);
// ---------------------------------

// ===============delete document==============
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(competitorValidation.deleteDocument),
  competitorController.deleteDocument
);
// ------------------------------------

module.exports = router;
