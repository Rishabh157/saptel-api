const router = require("express").Router();
const dealerPincodeController = require("./DealerPincodeController");
const validate = require("../../middleware/validate");
const dealerPincodeValidation = require("./DealerPincodeValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(dealerPincodeValidation.get),
  dealerPincodeController.get
);

router.get(
  "/company/:companyid/pincode/:pincode",
  authCheckMiddleware,
  validate(dealerPincodeValidation.getByPincode),
  dealerPincodeController.getByPincode
);

/**
 * get all document of a single dealer
 */
router.get(
  "/dealer/:dealerid/company/:companyid/",
  authCheckMiddleware,
  validate(dealerPincodeValidation.getDealerData),
  dealerPincodeController.getDealerPincode
);
/**
 * get all dealerPincode pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(dealerPincodeValidation.getAllFilter),
  dealerPincodeController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(dealerPincodeValidation.create),
  dealerPincodeController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(dealerPincodeValidation.update),
  dealerPincodeController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(dealerPincodeValidation.changeStatus),
  dealerPincodeController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id/pincode/:pincode",
  authCheckMiddleware,
  validate(dealerPincodeValidation.deleteDocument),
  dealerPincodeController.deleteDocument
);

module.exports = router;
