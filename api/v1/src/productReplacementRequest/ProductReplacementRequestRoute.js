const router = require("express").Router();
const productReplacementRequestController = require("./ProductReplacementRequestController");
const validate = require("../../middleware/validate");
const productReplacementRequestValidation = require("./ProductReplacementRequestValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(productReplacementRequestValidation.get),
  productReplacementRequestController.get
);
/**
 * get all productReplacementRequest pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(productReplacementRequestValidation.getAllFilter),
  productReplacementRequestController.allFilterPagination
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(productReplacementRequestValidation.getById),
  productReplacementRequestController.getById
);

//update manager status
/**
 * create new document
 */
router.put(
  "/update-manager",
  authCheckMiddleware,
  validate(productReplacementRequestValidation.updateManager),
  productReplacementRequestController.updateManager
);

//update cc status
/**
 * create new document
 */
router.put(
  "/cc-update-details",
  authCheckMiddleware,
  validate(productReplacementRequestValidation.ccUpdateDetails),
  productReplacementRequestController.ccUpdateDetails
);

//acounts update approval
/**
 * create new document
 */
router.put(
  "/account-approval",
  authCheckMiddleware,
  validate(productReplacementRequestValidation.accountApproval),
  productReplacementRequestController.accountApproval
);
module.exports = router;
