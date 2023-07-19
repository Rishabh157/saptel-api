const router = require("express").Router();
const artistController = require("./ArtistController");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");
const validate = require("../../middleware/validate");
const artistValitation = require("./ArtistValidation");

// ===============get new document==============
router.get(
  "/company/:companyid",

  authCheckMiddleware,
  validate(artistValitation.get),
  artistController.get
);
// ------------------------

// ===============get document By Id document==============
router.get(
  "/:id",

  authCheckMiddleware,
  validate(artistValitation.getById),
  artistController.getById
);
// ------------------------

// ===============get all artist by pagination filter document==============
router.post(
  "/",

  authCheckMiddleware,
  validate(artistValitation.getAllFilter),
  artistController.allFilterPagination
);
// ----------------------------

// ===============create new document==============
router.post(
  "/add",

  authCheckMiddleware,
  validate(artistValitation.create),
  artistController.add
);
// ----------------------------

// ===============update existing document==============
router.put(
  "/:id",

  authCheckMiddleware,
  validate(artistValitation.update),
  artistController.update
);
// ---------------------------------

// ===============delete document==============
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(artistValitation.deleteDocument),
  artistController.deleteDocument
);
// ------------------------------------

module.exports = router;
