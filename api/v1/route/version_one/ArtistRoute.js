const router = require("express").Router();
const artistController = require("../../controller/artist/ArtistController");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");
const validate = require("../../middleware/validate");
const artistValitation = require("../../validation/ArtistValidation");

// ===============get new document==============
router.get(
  "/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(artistValitation.get),
  artistController.get
);
// ------------------------

// ===============get document By Id document==============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(artistValitation.getById),
  artistController.getById
);
// ------------------------

// ===============get all artist by pagination filter document==============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(artistValitation.getAllFilter),
  artistController.allFilterPagination
);
// ----------------------------

// ===============create new document==============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(artistValitation.create),
  artistController.add
);
// ----------------------------

// ===============update existing document==============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(artistValitation.update),
  artistController.update
);
// ---------------------------------

// ===============delete document==============
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(artistValitation.deleteDocument),
  artistController.deleteDocument
);
// ------------------------------------

module.exports = router;
