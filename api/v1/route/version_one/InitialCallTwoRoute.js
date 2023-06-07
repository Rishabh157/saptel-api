const router = require("express").Router();
const validate = require("../../middleware/validate");
const initialCallTwoValidation = require("../../validation/InitialCallTwoValidation");
const initialCallTwoController = require("../../controller/initialCallTwo/InitialCallTwoController");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallTwoValidation.get),
  initialCallTwoController.get
);

//===============get document by id===============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallTwoValidation.getById),
  initialCallTwoController.getById
);

//===============get all document fo initialCallOne  Id===============
router.get(
  "/get-all/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallTwoValidation.getByDispositionOneId),
  initialCallTwoController.getByInitialCallOneId
);

//===============get all dispositionOne pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallTwoValidation.getAllFilter),
  initialCallTwoController.allFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallTwoValidation.create),
  initialCallTwoController.add
);

//===============update document===============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallTwoValidation.update),
  initialCallTwoController.update
);

//===============update status document===============
// router.put(
//   "/status-change/:id",
//   validate(initialCallOneValidation.changeStatus),
//   initialCallOneController.statusChange
// );

//===============delete document===============
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallTwoValidation.deleteDocument),
  initialCallTwoController.deleteDocument
);

module.exports = router;
