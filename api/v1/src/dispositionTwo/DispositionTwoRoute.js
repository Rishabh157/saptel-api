const router = require("express").Router();
const dispositionTwoController = require("./DispositionTwoController");
const dispositionTwoValidation = require("./DispositionTwoValidation");
const validate = require("../../middleware/validate");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionTwoValidation.get),
  dispositionTwoController.get
);

//===============get one document (if query) / all document  (without token)===============
router.get(
  "/unauth/",
  // accessModuleCheck,
  // authCheckMiddleware,
  validate(dispositionTwoValidation.get),
  dispositionTwoController.get
);

//===============get all document fo dispositionTwo Id Wihtout token===============
router.get(
  "/unauth/get-all/:id",
  // accessModuleCheck,
  // authCheckMiddleware,
  validate(dispositionTwoValidation.getByDispositionOneId),
  dispositionTwoController.getByDispositionOneId
);

//===============get document by id===============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionTwoValidation.getById),
  dispositionTwoController.getById
);

//===============get all document fo dispositionOne Id===============
router.get(
  "/get-all/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionTwoValidation.getByDispositionOneId),
  dispositionTwoController.getByDispositionOneId
);

//===============get all dispositionOne pagination filter===============

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionTwoValidation.getAllFilter),
  dispositionTwoController.getFilterPagination
);
//===============create new document===============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionTwoValidation.create),
  dispositionTwoController.add
);

//===============update document===============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionTwoValidation.update),
  dispositionTwoController.update
);

//===============update status document===============
router.put(
  "/status-change/:id",
  validate(dispositionTwoValidation.changeStatus),
  dispositionTwoController.statusChange
);

//===============delete document===============
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionTwoValidation.deleteDocument),
  dispositionTwoController.deleteDocument
);

module.exports = router;
