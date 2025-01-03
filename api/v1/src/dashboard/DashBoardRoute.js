const router = require("express").Router();
const DashBoardController = require("./DashBoardController");
const DashBoardValidation = require("./DashBoardValidation");

const validate = require("../../middleware/validate");
const {
  authCheckMiddleware,
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/dealer-dashboard/dealer-order-status-count",
  authCheckDealerMiddleware,
  //   validate(dealerValidation.get),
  DashBoardController.get
);

//===============get all pagination filter===============
router.post(
  "/get-agent-dashboard-data",
  authCheckMiddleware,
  validate(DashBoardValidation.getAgentDashboardData),
  DashBoardController.getAgentDashboardData
);

// =============== ZM Dashboard API =================
router.post(
  "/zm-dashboard/order-summary",
  authCheckMiddleware,
  validate(DashBoardValidation.getZmDashboardData),
  DashBoardController.getZmDashboard
);

// =============== ZM Dashboard API =================
router.post(
  "/zm-dashboard/dealer-summary",
  authCheckMiddleware,
  validate(DashBoardValidation.getZmDashboardData),
  DashBoardController.getZmDealerSummaray
);
// =============== ZM Dashboard API =================
router.post(
  "/zm-dashboard/dealer-stock",
  authCheckMiddleware,
  validate(DashBoardValidation.getZmDashboardData),
  DashBoardController.getZmDealerStock
);

// =============== Warehouse Dashboard API =================
router.get(
  "/warehouse-inventory/:wid",
  authCheckMiddleware,
  validate(DashBoardValidation.getWhDashboardData),
  DashBoardController.getWhDashboardInventory
);

// =============== Warehouse Dashboard API =================
router.post(
  "/warehouse-outward-stock/:wid",
  authCheckMiddleware,
  validate(DashBoardValidation.getWhInwartOutwardData),
  DashBoardController.getWhOutwardStock
);

// =============== Warehouse Dashboard API =================
router.post(
  "/warehouse-inward-stock/:wid",
  authCheckMiddleware,
  validate(DashBoardValidation.getWhInwartOutwardData),
  DashBoardController.getWhInwardStock
);

// =============== dealer Dashboard API =================
router.post(
  "/dealer-order-status",
  authCheckDealerMiddleware,
  validate(DashBoardValidation.getOrderDashboardCount),
  DashBoardController.getAllOrderStatusCountForDealer
);

// =============== dealer Dashboard API =================
router.post(
  "/dealer-pincode-dashboard",
  authCheckDealerMiddleware,
  validate(DashBoardValidation.getOrderDashboardCount),
  DashBoardController.getDealerPincodeDashboard
);
// =============== dealer Dashboard API =================
router.post(
  "/dealer-product-dashboard",
  authCheckDealerMiddleware,
  validate(DashBoardValidation.getOrderDashboardCount),
  DashBoardController.getDealerProductDashboard
);

// =============== sales Dashboard API =================
router.post(
  "/sales-dashboard",
  authCheckMiddleware,
  validate(DashBoardValidation.getOrderDashboardCount),
  DashBoardController.getSalesDashboard
);

// =============== Admin Dashboard Total number of active dealer, active vendor, company warehouse =================
router.get(
  "/admin-basicinfo",
  authCheckMiddleware,
  // validate(DashBoardValidation.getDvwInfo),
  DashBoardController.getAdminBasicInfo
);

module.exports = router;
