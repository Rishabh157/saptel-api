const router = require("express").Router();
const moneyBackRequestController = require("./MoneyBackRequestController");
const validate = require("../../middleware/validate");
const moneyBackRequestValidation = require("./MoneyBackRequestValidation");

const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(moneyBackRequestValidation.get),
  moneyBackRequestController.get
);
/**
 * get all moneyBackRequest pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(moneyBackRequestValidation.getAllFilter),
  moneyBackRequestController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(moneyBackRequestValidation.create),
  moneyBackRequestController.add
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(moneyBackRequestValidation.getById),
  moneyBackRequestController.getById
);

//update manager status
/**
 * create new document
 */
router.put(
  "/update-manager",
  authCheckMiddleware,
  validate(moneyBackRequestValidation.updateManager),
  moneyBackRequestController.updateManager
);

//update cc status
/**
 * create new document
 */
router.put(
  "/cc-update-details",
  authCheckMiddleware,
  validate(moneyBackRequestValidation.ccUpdateDetails),
  moneyBackRequestController.ccUpdateDetails
);

//acounts update approval
/**
 * create new document
 */
router.put(
  "/account-approval",
  authCheckMiddleware,
  validate(moneyBackRequestValidation.accountApproval),
  moneyBackRequestController.accountApproval
);

module.exports = router;
