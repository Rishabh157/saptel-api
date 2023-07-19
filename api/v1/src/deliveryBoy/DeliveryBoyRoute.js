const router = require("express").Router();
const deliveryBoyController = require("./DeliveryBoyController");
const validate = require("../../middleware/validate");
const deliveryBoyValidation = require("./DeliveryBoyValidation");
const {
  authCheckDealerMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckDealerMiddleware,
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

module.exports = router;
