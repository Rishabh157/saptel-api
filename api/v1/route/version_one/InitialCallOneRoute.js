const router = require("express").Router();
const validate = require("../../middleware/validate");
const initialCallOneValidation = require("../../validation/InitialCallOneValidation");
const initialCallOneController = require("../../controller/initialCallOne/InitialCallOneController");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallOneValidation.get),
  initialCallOneController.get
);

//===============get document by id===============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallOneValidation.getByDispositionOneId),
  initialCallOneController.getById
);

//===============get all dispositionOne pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallOneValidation.getAllFilter),
  initialCallOneController.allFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallOneValidation.create),
  initialCallOneController.add
);

//===============update document===============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallOneValidation.update),
  initialCallOneController.update
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
  validate(initialCallOneValidation.deleteDocument),
  initialCallOneController.deleteDocument
);

module.exports = router;
