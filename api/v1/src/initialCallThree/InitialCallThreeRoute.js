const router = require("express").Router();
const initialCallThreeController = require("./InitialCallThreeController");
const initialCallThreeValidation = require("./InitialCallThreeValidation");
const validate = require("../../middleware/validate");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  authCheckMiddleware,
  validate(initialCallThreeValidation.get),
  initialCallThreeController.get
);

//===============get document by id===============
router.get(
  "/:id",
  authCheckMiddleware,
  validate(initialCallThreeValidation.getById),
  initialCallThreeController.getById
);

//===============get all document fo initialCallOne  Id===============
router.get(
  "/get-all/:initialCallTwoId/calltype/:calltype",
  authCheckMiddleware,
  validate(initialCallThreeValidation.getByInitialCallTwoId),
  initialCallThreeController.getByInitialCallTwoId
);

//===============get all pagination filter===============
router.post(
  "/",
  authCheckMiddleware,
  validate(initialCallThreeValidation.getAllFilter),
  initialCallThreeController.allFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  authCheckMiddleware,
  validate(initialCallThreeValidation.create),
  initialCallThreeController.add
);

//===============update document===============
router.put(
  "/:id",
  authCheckMiddleware,
  validate(initialCallThreeValidation.update),
  initialCallThreeController.update
);

//===============update status document===============
router.put(
  "/status-change/:id",
  validate(initialCallThreeValidation.changeStatus),
  initialCallThreeController.statusChange
);

//===============delete document===============
// router.delete(
//   "/:id",
//   authCheckMiddleware,
//   validate(initialCallThreeValidation.deleteDocument),
//   initialCallThreeController.deleteDocument
// );

module.exports = router;
