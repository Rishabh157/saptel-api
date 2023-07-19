const router = require("express").Router();
const competitorController = require("./CompetitorController");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");
const validate = require("../../middleware/validate");

const competitorValidation = require("./CompetitorValidation");

// ===============get new document==============
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(competitorValidation.get),
  competitorController.get
);
// ------------------------

// ===============get document By Id document==============
router.get(
  "/:id",
  authCheckMiddleware,
  validate(competitorValidation.getById),
  competitorController.getById
);
// ------------------------

// ===============get all artist by pagination filter document==============
router.post(
  "/",
  authCheckMiddleware,
  validate(competitorValidation.getAllFilter),
  competitorController.allFilterPagination
);
// ----------------------------

// ===============create new document==============
router.post(
  "/add",
  authCheckMiddleware,
  validate(competitorValidation.create),
  competitorController.add
);
// ----------------------------

// ===============update existing document==============
router.put(
  "/:id",
  authCheckMiddleware,
  validate(competitorValidation.update),
  competitorController.update
);
// ---------------------------------

// ===============delete document==============
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(competitorValidation.deleteDocument),
  competitorController.deleteDocument
);
// ------------------------------------

module.exports = router;
