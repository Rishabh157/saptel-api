const router = require("express").Router();
const websiteMetaTagController = require("../../controller/websiteMetaTag/WebsiteMetaTagController");
const websiteMetaTagValidation = require("../../validation/WebsiteMetaTagValidation");
const validate = require("../../middleware/validate");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMetaTagValidation.get),
  websiteMetaTagController.get
);

//===============get document by id===============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMetaTagValidation.getById),
  websiteMetaTagController.getById
);

//===============get all pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMetaTagValidation.getAllFilter),
  websiteMetaTagController.allFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMetaTagValidation.create),
  websiteMetaTagController.add
);

//===============update document===============
router.put(
  "/:id",
  accessModuleCheck,
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
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMetaTagValidation.deleteDocument),
  websiteMetaTagController.deleteDocument
);

module.exports = router;
