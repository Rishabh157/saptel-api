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

// dealer app deliver order

router.put(
  "/dealer/update-order-status",
  authCheckDealerMiddleware,
  validate(orderValidation.updateStatus),
  orderController.updateOrderStatus
);

// assign order
router.put(
  "/assign-order",
  authCheckMiddleware,
  validate(orderValidation.assignOrder),
  orderController.assignOrder
);

// assign order for dealer app
router.put(
  "/dealer/assign-order",
  authCheckDealerMiddleware,
  validate(orderValidation.assignOrderToDeliveryBoy),
  orderController.assignOrderToDeliveryBoy
);

// assign order for dealer app
router.put(
  "/approve-order/:orderid",
  authCheckMiddleware,
  validate(orderValidation.dealerApprove),
  orderController.dealerApprove
);

//===============get one document (if query) / all document===============
router.get(
  "/",
  authCheckMiddleware,
  //   validate(orderValidation.get),
  orderController.get
);

//===============get one document (if query) / all document===============
router.post(
  "/get-multiple-orders",
  authCheckMiddleware,
  validate(orderValidation.getMultipleOrder),
  orderController.getMultipleOrder
);

//=============== Global search order===============
router.post(
  "/global-search",
  authCheckMiddleware,
  validate(orderValidation.getGlobalSearch),
  orderController.globalSearch
);
//===============get one document (if query) / all document===============
router.get(
  "/unauth/phoneno/:phno/type/:type",
  //   validate(orderValidation.get),
  orderController.getUnAuth
);

//===============get document by id===============
router.get(
  "/:id",
  authCheckMiddleware,
  //   validate(orderValidation),
  orderController.getById
);

//===============get document by id===============
router.get(
  "/unauth/:id",
  // authCheckMiddleware,
  //   validate(orderValidation),
  orderController.getById
);

//===============get document by mobile number===============
router.post(
  "/get-customer-info",
  authCheckMiddleware,
  validate(orderValidation.getComplainData),
  orderController.getByMobileNumber
);

//===============get document by id for dealer===============
router.get(
  "/dealer/:id",
  authCheckDealerMiddleware,
  //   validate(orderValidation),
  orderController.getByIdForDealer
);

// get by order number
//===============get document by id for dealer===============
router.get(
  "/get-by-order-number/:ordernumber",
  authCheckMiddleware,
  //   validate(orderValidation),
  orderController.getByOrderNumber
);

// get by order number for dealer
//===============get document by id for dealer===============
router.get(
  "/dealer/get-by-order-number/:ordernumber",
  authCheckDealerMiddleware,
  //   validate(orderValidation),
  orderController.getByOrderNumber
);

// get order data by number unauth
router.get(
  "/unauth/:phno/get-by-phnumber",

  orderController.getUnAuthGetByPhNumber
);

// get active order data by number
router.get("/unauth/get-active-order/:phno", orderController.getActiveOrder);

// get dealer NDR order
router.get("/get-dealer-ndr/:phno", orderController.getDealerNDROrder);

// get warehouse NDR order
router.get("/get-warehouse-ndr/:phno", orderController.getWarehouseNDROrder);

//===============get all pagination filter===============
router.post(
  "/",
  authCheckMiddleware,
  validate(orderValidation.getAllFilter),
  orderController.allFilterPagination
);

//===============get all pagination filter===============
router.post(
  "/warehouse-first-call",
  authCheckMiddleware,
  validate(orderValidation.getAllFilter),
  orderController.allFilterPaginationFirstCall
);

router.post(
  "/get-dileveryboy-order",
  authCheckDeliveryBoyMiddleware,
  orderController.allFilterPaginationDileveryBoy
);

// dealer app
router.post(
  "/dealer/get-dileveryboy-order",
  authCheckDealerMiddleware,
  validate(orderValidation.getAllFilterDeliveryBoy),
  orderController.allFilterPaginationDileveryBoyForDealerPanel
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
//   // authCheckMiddleware,
//   // validate(orderValidation.create),
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

//===============update Dealer NDR===============

router.put(
  "/update-dealer-ndr/:id",
  validate(orderValidation.updateDealerNdr),
  orderController.updateDealerNdr
);

//===============update Courier NDR===============

router.put(
  "/update-courier-ndr/:id",
  validate(orderValidation.updateCourierNdr),
  orderController.updateCourierNdr
);

//===============update Courier NDR===============

router.put(
  "/change-scheme/:id",
  validate(orderValidation.changeScheme),
  orderController.changeScheme
);

// approve first call confirmation directly
router.put(
  "/approve-first-call/:id",
  authCheckMiddleware,
  validate(orderValidation.approveFirstCallDirectly),
  orderController.approveFirstCallDirectly
);

// approve first call confirmation
router.put(
  "/first-call-confirmation/:id",
  authCheckMiddleware,
  validate(orderValidation.firstCallConfirmation),
  orderController.firstCallConfirmation
);

// approve first call confirmation
router.put(
  "/unauth/first-call-confirmation/:id",
  validate(orderValidation.firstCallConfirmationUnauth),
  orderController.firstCallConfirmationUnauth
);
//===============update status document===============
// router.put(
//   "/status-change/:id",
//   validate(initialCallOneValidation.changeStatus),
//   initialCallOneController.statusChange
// );

//===============change order status document===============
router.put(
  "/change-order-status/:id",
  authCheckMiddleware,
  validate(orderValidation.orderStatusChange),
  orderController.orderStatusChange
);

//===============dealer change order status===============
router.put(
  "/dealer/change-order-status/:id",
  authCheckDealerMiddleware,
  validate(orderValidation.dealerOrderStatusChange),
  orderController.dealerOrderStatusChange
);

//===============delete document===============
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(orderValidation.deleteDocument),
  orderController.deleteDocument
);

module.exports = router;
