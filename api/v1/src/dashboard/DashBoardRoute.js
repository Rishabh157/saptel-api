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

module.exports = router;
