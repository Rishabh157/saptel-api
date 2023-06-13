const router = require("express").Router();
const initialCallThreeController = require("../../controller/initialCallThree/InitialCallThreeController");
const initialCallThreeValidation = require("./InitialCallThreeValidation");
const validate = require("../../middleware/validate");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallThreeValidation.get),
  initialCallThreeController.get
);

//===============get document by id===============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallThreeValidation.getById),
  initialCallThreeController.getById
);

//===============get all document fo initialCallOne  Id===============
router.get(
  "/get-all/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallThreeValidation.getByInitialCallTwoId),
  initialCallThreeController.getByInitialCallTwoId
);

//===============get all pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallThreeValidation.getAllFilter),
  initialCallThreeController.allFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallThreeValidation.create),
  initialCallThreeController.add
);

//===============update document===============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallThreeValidation.update),
  initialCallThreeController.update
);

//===============update status document===============
// router.put(
//   "/status-change/:id",
//   validate(initialCallThreeValidation.changeStatus),
//   initialCallThreeController.statusChange
// );

//===============delete document===============
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(initialCallThreeValidation.deleteDocument),
  initialCallThreeController.deleteDocument
);

module.exports = router;
