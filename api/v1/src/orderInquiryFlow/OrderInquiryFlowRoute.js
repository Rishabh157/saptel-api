const router = require("express").Router();
const validate = require("../../middleware/validate");
const orderValidation = require("./OrderInquiryFlowValidation");
const orderController = require("./OrderInquiryFlowController");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  authCheckMiddleware,
  validate(orderValidation.get),
  orderController.get
);

//===============get document by id===============
router.get(
  "/:id",
  authCheckMiddleware,
  //   validate(orderValidation),
  orderController.getById
);

//===============get all pagination filter===============
router.post("/", authCheckMiddleware, orderController.allFilterPagination);

//===============get all pagination filter===============

//===============create new document===============
// router.post(
//   "/add",
//   authCheckMiddleware,
//   validate(orderValidation.create),
//   orderController.add
// );

//===============update document===============
router.put(
  "/:id",
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
  authCheckMiddleware,
  validate(orderValidation.deleteDocument),
  orderController.deleteDocument
);

module.exports = router;
