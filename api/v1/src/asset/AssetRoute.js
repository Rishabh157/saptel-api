const router = require("express").Router();
const assetController = require("./AssetController");
const assetValidation = require("./AssetValidation");
const validate = require("../../middleware/validate");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetValidation.get),
  assetController.get
);

//===============get document by id===============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetValidation.getById),
  assetController.getById
);

//===============get all pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetValidation.getAllFilter),
  assetController.allFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetValidation.create),
  assetController.add
);

//===============update document===============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetValidation.update),
  assetController.update
);

//===============update status document===============
// router.put(
//   "/status-change/:id",
//   validate(assetValidation.changeStatus),
//   assetController.statusChange
// );

//===============delete document===============
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(assetValidation.deleteDocument),
  assetController.deleteDocument
);

module.exports = router;
