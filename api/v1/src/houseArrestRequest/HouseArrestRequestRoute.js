const router = require("express").Router();
const houseArrestRequestController = require("./HouseArrestRequestController");
const validate = require("../../middleware/validate");
const houseArrestRequestValidation = require("./HouseArrestRequestValidation");

const {
  authCheckMiddleware,
  otpVerifyToken,
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(houseArrestRequestValidation.get),
  houseArrestRequestController.get
);
/**
 * get all houseArrestRequest pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(houseArrestRequestValidation.getAllFilter),
  houseArrestRequestController.allFilterPagination
);

/**
 * get all houseArrestRequest pagination filter
 */

router.post(
  "/dealer-list",
  authCheckDealerMiddleware,
  validate(houseArrestRequestValidation.getAllFilter),
  houseArrestRequestController.allFilterPaginationForDealer
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(houseArrestRequestValidation.create),
  houseArrestRequestController.add
);

/**
 * customer care details update
 */
router.put(
  "/cc-info-update",
  authCheckMiddleware,
  validate(houseArrestRequestValidation.ccInfoUpdate),
  houseArrestRequestController.ccInfoUpdate
);

/**
 * manager approval
 */
router.put(
  "/manager-approval",
  authCheckMiddleware,
  validate(houseArrestRequestValidation.updateManager),
  houseArrestRequestController.updateManager
);

//acounts update approval
/**
 * create new document
 */
router.put(
  "/account-approval",
  authCheckMiddleware,
  validate(houseArrestRequestValidation.accountApproval),
  houseArrestRequestController.accountApproval
);

//dealer update approval
/**
 * create new document
 */
router.put(
  "/dealer-approval",
  authCheckDealerMiddleware,
  validate(houseArrestRequestValidation.dealerApproval),
  houseArrestRequestController.dealerApproval
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(houseArrestRequestValidation.getById),
  houseArrestRequestController.getById
);

module.exports = router;
