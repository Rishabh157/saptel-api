const router = require("express").Router();
const deliveryBoyController = require("../../controller/deliveryBoy/DeliveryBoyController");
const validate = require("../../middleware/validate");
const deliveryBoyValidation = require("../../validation/DeliveryBoyValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const {
  authCheckDealerMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.get),
  deliveryBoyController.get
);
/**
 * get all deliveryBoy pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.getAllFilter),
  deliveryBoyController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.create),
  deliveryBoyController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.update),
  deliveryBoyController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.changeStatus),
  deliveryBoyController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(deliveryBoyValidation.deleteDocument),
  deliveryBoyController.deleteDocument
);

module.exports = router;
