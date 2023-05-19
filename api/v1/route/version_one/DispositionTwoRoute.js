const router = require("express").Router();
const dispositionTwoController = require("../../controller/dispositionTwo/DispositionTwoController");
const dispositionTwoValidation = require("../../validation/DispositionTwoValidation");
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

//===============update document===============
router.put(
  "/status-change/:id",
  validate(dispositionTwoValidation.changeStatus),
  dispositionTwoController.statusChange
);

//===============update document===============
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionTwoValidation.deleteDocument),
  dispositionTwoController.deleteDocument
);

module.exports = router;
