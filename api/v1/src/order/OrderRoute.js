const router = require("express").Router();
const validate = require("../../middleware/validate");
const orderValidation = require("./OrderValidation");
const orderController = require("./OrderController");
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
  //   validate(orderValidation.get),
  orderController.get
);

//===============get document by id===============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  //   validate(orderValidation),
  orderController.getById
);

//===============get all pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  orderController.allFilterPagination
);

//===============create new document===============
// router.post(
//   "/add",
//   accessModuleCheck,
//   authCheckMiddleware,
//   validate(orderValidation.create),
//   orderController.add
// );

//===============update document===============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  // validate(orderValidation.update),
  orderController.update
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
  validate(orderValidation.deleteDocument),
  orderController.deleteDocument
);

module.exports = router;
