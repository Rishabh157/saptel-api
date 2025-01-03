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
  "/warehouse-order-dispatch",
  authCheckMiddleware,
  validate(orderValidation.warehouseOrderDispatch),
  orderController.warehouseOrderDispatch
);

//unfreeze order
router.put(
  "/unfreeze-order/:ordernumber",
  authCheckMiddleware,
  validate(orderValidation.unfreezeOrder),
  orderController.unfreezeOrder
);

router.put(
  "/warehouse-manual-order-dispatch",
  authCheckMiddleware,
  validate(orderValidation.warehouseManualOrderDispatch),
  orderController.warehouseManualOrderDispatch
);

router.post(
  "/get-all-order-status-count",
  authCheckMiddleware,
  validate(orderValidation.getOrderDashboardCount),

  orderController.getAllOrderStatusCount
);

//warehouse dipatch order status count GPO
router.post(
  "/get-gpo-order-status/:wid",
  authCheckMiddleware,
  validate(orderValidation.getOrderDashboardCount),
  orderController.getGPOOrderStatusCount
);

//warehouse dipatch order status count shipyaari
router.post(
  "/get-shipyaari-order-status/:wid",
  authCheckMiddleware,
  validate(orderValidation.getOrderDashboardCount),
  orderController.getShipyaariOrderStatusCount
);

//warehouse dipatch order status count e-comm
router.post(
  "/get-ecom-order-status/:wid",
  authCheckMiddleware,
  validate(orderValidation.getOrderDashboardCount),
  orderController.getEcomOrderStatusCount
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
  validate(orderValidation.prePaidApprove),
  orderController.prePaidApprove
);

//===============get one document (if query) / all document===============
router.get(
  "/",
  authCheckMiddleware,
  //   validate(orderValidation.get),
  orderController.get
);

//===============get azazone orders===============
router.get(
  "/get-sts-token",
  // authCheckMiddleware,
  //   validate(orderValidation.get),
  orderController.getAmazoneOrder
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

//===============get document by id for delivery boy===============
router.get(
  "/deliveryboy/order/:id",
  authCheckDeliveryBoyMiddleware,
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

// get by order number for manual assigning  barcode to order
//===============get document by id for dealer===============
router.get(
  "/get-by-order-number/manual-mapping/:ordernumber/warehouseid/:assignWarehouseId",
  authCheckMiddleware,
  //   validate(orderValidation),
  orderController.getByOrderNumberForMannualMapping
);

// get by order number
//===============get document by id for dealer===============
router.get(
  "/get-by-order-number-for-invoice/:ordernumber",
  authCheckMiddleware,
  //   validate(orderValidation),
  orderController.getByOrderNumberForInvoice
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
// get order data by number auth
router.get(
  "/:phno/get-by-phnumber",
  authCheckMiddleware,
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

//===============get all batch pagination filter===============
router.post(
  "/get-batch",
  authCheckMiddleware,
  validate(orderValidation.getAllFilter),
  orderController.getBatchFilterPagination
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

// get label of product assigned to courier by awb number
router.post(
  "/get-order-label",
  authCheckMiddleware,
  validate(orderValidation.getOrderLabel),
  orderController.getOrderLabel
);

// generate order invoice of product assigned to courier by awb number
router.post(
  "/generate-order-invoice",
  authCheckMiddleware,
  validate(orderValidation.generateOrderInvoice),
  orderController.generateOrderInvoice
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
  validate(orderValidation.getAllFilter),
  orderController.allFilterDealerOrderPagination
);

//===============create new document===============
// router.post(
//   "/add",
//   authCheckMiddleware,
//   // validate(orderValidation.create),
//   orderController.add
// );

// bilk upload
// router.post(
//   "/bulk-upload",
//   // authCheckMiddleware,
//   // validate(orderValidation.create),
//   orderController.bulkAdd
// );

// order add for e-commerce
// router.put(
//   "/e-commerce/add",
//   authCheckMiddleware,
//   validate(orderValidation.ecomValidation),
//   orderController.add
// );
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

// bulk upload barcode to change Status Delivered or RTO without excel
router.post(
  "/bulk-upload/status-change/:wid",
  authCheckMiddleware,
  validate(orderValidation.bulkStatusChange),
  orderController.bulkStatusChange
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

//===============Mark as delivered===============
router.put(
  "/mark-as-delivered/:id",
  authCheckMiddleware,
  validate(orderValidation.orderStatusChange),
  orderController.markAsDelivered
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
