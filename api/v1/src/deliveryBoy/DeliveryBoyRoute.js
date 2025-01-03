const router = require("express").Router();
const deliveryBoyController = require("./DeliveryBoyController");
const validate = require("../../middleware/validate");
const deliveryBoyValidation = require("./DeliveryBoyValidation");
const {
  authCheckDealerMiddleware,
  authCheckMiddleware,
  authCheckDeliveryBoyMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.get),
  deliveryBoyController.get
);

router.get(
  "/:id",
  authCheckDeliveryBoyMiddleware,
  // validate(deliveryBoyValidation.get),
  deliveryBoyController.getById
);

/**
 * get one document (if query) / all documents
 */
router.get(
  "/get-delivery-boy",
  authCheckMiddleware,
  validate(deliveryBoyValidation.get),
  deliveryBoyController.get
);
/**
 * get all deliveryBoy pagination filter
 */

router.post(
  "/",
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.getAllFilter),
  deliveryBoyController.allFilterPagination
);

// for dealers app
router.get(
  "/dealer/deliveryboy",
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.get),
  deliveryBoyController.get
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.create),
  deliveryBoyController.add
);
/**
 * change password
 */
router.put(
  "/change-password",
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.changePasswordValid),
  deliveryBoyController.changePassword
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.update),
  deliveryBoyController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.changeStatus),
  deliveryBoyController.statusChange
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.deleteDocument),
  deliveryBoyController.deleteDocument
);

router.post(
  "/login",
  validate(deliveryBoyValidation.loginValid),
  deliveryBoyController.login
);

module.exports = router;
