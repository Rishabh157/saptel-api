const router = require("express").Router();
const dispositionThreeController = require("./DispositionThreeController");
const dispositionThreeValidation = require("./DispositionThreeValidation");
const validate = require("../../middleware/validate");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionThreeValidation.get),
  dispositionThreeController.get
);

//===============get one document (if query) / all document  (without token)===============
router.get(
  "/unauth/",
  // accessModuleCheck,
  // authCheckMiddleware,
  validate(dispositionThreeValidation.get),
  dispositionThreeController.get
);

//===============get document by id===============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionThreeValidation.getById),
  dispositionThreeController.getById
);
//===============get all document fo dispositionTwoId (without token)===============
router.get(
  "/unauth/get-all/:id",
  // accessModuleCheck,
  // authCheckMiddleware,
  validate(dispositionThreeValidation.getByDispositionOneId),
  dispositionThreeController.getByDispositionTwoId
);

//===============get all document fo dispositionTwo Id===============
router.get(
  "/get-all/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionThreeValidation.getByDispositionOneId),
  dispositionThreeController.getByDispositionTwoId
);

//===============get all pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionThreeValidation.getAllFilter),
  dispositionThreeController.getFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionThreeValidation.create),
  dispositionThreeController.add
);

//===============update document===============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionThreeValidation.update),
  dispositionThreeController.update
);

//===============update status document===============
// router.put(
//   "/status-change/:id",
//   validate(dispositionThreeValidation.changeStatus),
//   dispositionThreeController.statusChange
// );

//===============delete document===============
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionThreeValidation.deleteDocument),
  dispositionThreeController.deleteDocument
);

module.exports = router;
