const router = require("express").Router();
const reportController = require("./ReportsController");
const validate = require("../../middleware/validate");
const reportValidation = require("./ReportsValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

router.post(
  "/agent-order-status",
  authCheckMiddleware,
  validate(reportValidation.agentOrderStatus),
  reportController.agentOrderStatus
);

router.post(
  "/agent-wise-complaint",
  authCheckMiddleware,
  validate(reportValidation.agentWiseComplaint),
  reportController.agentWiseComplaint
);

//===============get all inquiry pagination filter===============
router.post(
  "/all-inquiry",
  authCheckMiddleware,
  validate(reportValidation.getAllInquiryFilter),
  reportController.allInquiryFilterPagination
);

module.exports = router;
