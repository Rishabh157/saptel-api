const router = require("express").Router();
const dispositionTwoController = require("../../controller/dispositionTwo/DispositionTwoController");
const dispositionTwoValidation = require("../../validation/DispositionTwoValidation");
const validate = require("../../middleware/validate");
const { accesModuleCheck } = require("../../middleware/accessModuleCheck");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  validate(dispositionTwoValidation.get),
  dispositionTwoController.get
);

//===============get all document fo dispositionOne Id===============
router.get(
  "/get-all",
  validate(dispositionTwoValidation.getByDispositionOneId),
  dispositionTwoController.getByDispositionOneId
);

//===============get all dispositionOne pagination filter===============
router.post(
  "/",
  validate(dispositionTwoValidation.getAllFilter),
  dispositionTwoController.getFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  //   accesModuleCheck,
  //   authCheckMiddleware,
  validate(dispositionTwoValidation.create),
  dispositionTwoController.add
);

//===============update document===============
router.put(
  "/:id",
  validate(dispositionTwoValidation.update),
  dispositionTwoController.update
);

//===============update document===============
router.put(
  "/status-change/:id",
  validate(dispositionTwoValidation.changeStatus),
  dispositionTwoController.statusChange
);

module.exports = router;
