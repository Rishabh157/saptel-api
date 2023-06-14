const router = require("express").Router();
const validate = require("../../middleware/validate");
const prepaidOrderValidation = require("./PrepaidOrderValidation");
const prepaidOrderController = require("./PrepaidOrderController");
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
  validate(prepaidOrderValidation.get),
  prepaidOrderController.get
);

//===============get document by id===============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(prepaidOrderValidation.getById),
  prepaidOrderController.getById
);

//===============get all pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(prepaidOrderValidation.getAllFilter),
  prepaidOrderController.allFilterPagination
);

//===============create new document===============
// router.post(
//   "/add",
//   accessModuleCheck,
//   authCheckMiddleware,
//   validate(prepaidOrderValidation.create),
//   prepaidOrderController.add
// );

//===============update document===============
// router.put(
//   "/:id",
//   accessModuleCheck,
//   authCheckMiddleware,
//   validate(prepaidOrderValidation.update),
//   prepaidOrderController.update
// );

//===============update status document===============
router.put(
  "/approved-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(prepaidOrderValidation.changeApprovedStatus),
  prepaidOrderController.changeApprovedStatus
);

//===============delete document===============
// router.delete(
//   "/:id",
//   accessModuleCheck,
//   authCheckMiddleware,
//   validate(prepaidOrderValidation.deleteDocument),
//   prepaidOrderController.deleteDocument
// );

module.exports = router;
