const router = require("express").Router();
const validate = require("../../middleware/validate");
const orderValidation = require("./OrderInquiryValidation");
const orderController = require("./OrderInquiryController");
const {
  authCheckMiddleware,
  otpVerifyToken,
  authCheckDealerMiddleware,
  authCheckDeliveryBoyMiddleware,
} = require("../../middleware/authenticationCheck");

router.put(
  "/delivery-boy/update-order-status",
  authCheckDeliveryBoyMiddleware,
  validate(orderValidation.updateStatus),
  orderController.updateOrderStatus
);

router.put(
  "/dealer/update-order-status",
  authCheckDealerMiddleware,
  validate(orderValidation.updateStatus),
  orderController.updateOrderStatus
);

//===============get one document (if query) / all document===============
router.get(
  "/",
  authCheckMiddleware,
  //   validate(orderValidation.get),
  orderController.get
);

//===============get document by id===============
router.get(
  "/:id",
  authCheckMiddleware,
  //   validate(orderValidation),
  orderController.getById
);

//===============get document by id for dealer===============
router.get(
  "/dealer/:id",
  authCheckDealerMiddleware,
  //   validate(orderValidation),
  orderController.getByIdForDealer
);

//===============get all pagination filter===============
router.post("/", authCheckMiddleware, orderController.allFilterPagination);

router.post(
  "/get-dileveryboy-order",
  authCheckDeliveryBoyMiddleware,
  orderController.allFilterPaginationDileveryBoy
);

//===============get all pagination filter===============
router.post(
  "/dealer/:dealerId/orders",
  authCheckDealerMiddleware,
  orderController.allFilterDealerOrderPagination
);

//===============create new document===============
// router.post(
//   "/add",
//   authCheckMiddleware,
//   validate(orderValidation.create),
//   orderController.add
// );

// order add for e-commerce
router.put(
  "/e-commerce/add",
  authCheckMiddleware,
  validate(orderValidation.ecomValidation),
  orderController.add
);
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

//===============change order status document===============
router.delete(
  "/change-order-status/:id",
  authCheckMiddleware,
  validate(orderValidation.orderStatusChange),
  orderController.orderStatusChange
);

//===============delete document===============
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(orderValidation.deleteDocument),
  orderController.deleteDocument
);

module.exports = router;
