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

module.exports = router;
