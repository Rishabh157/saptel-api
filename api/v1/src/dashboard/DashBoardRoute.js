const router = require("express").Router();
const DashBoardController = require("./DashBoardController");
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

module.exports = router;
