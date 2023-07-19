const router = require("express").Router();
const websiteMetaTagController = require("./WebsiteMetaTagController");
const websiteMetaTagValidation = require("./WebsiteMetaTagValidation");
const validate = require("../../middleware/validate");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(websiteMetaTagValidation.get),
  websiteMetaTagController.get
);

//===============get document by id===============
router.get(
  "/:id",
  authCheckMiddleware,
  validate(websiteMetaTagValidation.getById),
  websiteMetaTagController.getById
);

//===============get all pagination filter===============
router.post(
  "/",
  authCheckMiddleware,
  validate(websiteMetaTagValidation.getAllFilter),
  websiteMetaTagController.allFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  authCheckMiddleware,
  validate(websiteMetaTagValidation.create),
  websiteMetaTagController.add
);

//===============update document===============
router.put(
  "/:id",
  authCheckMiddleware,
  validate(websiteMetaTagValidation.update),
  websiteMetaTagController.update
);

//===============update status document===============
// router.put(
//   "/status-change/:id",
//   validate(websiteMetaTagValidation.changeStatus),
//   websiteMetaTagController.statusChange
// );

//===============delete document===============
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(websiteMetaTagValidation.deleteDocument),
  websiteMetaTagController.deleteDocument
);

module.exports = router;
