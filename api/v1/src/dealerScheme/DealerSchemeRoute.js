const router = require("express").Router();
const dealerSchemeController = require("./DealerSchemeController");
const validate = require("../../middleware/validate");
const dealerSchemeValidation = require("./DealerSchemeValidation");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(dealerSchemeValidation.get),
  dealerSchemeController.get
);

// get all by pincode
router.post(
  "/check-serviceability",
  authCheckMiddleware,
  validate(dealerSchemeValidation.geserviceability),
  dealerSchemeController.geserviceability
);

/**
 * get one document
 */
router.get(
  "/company/:companyid/dealer/:dealerid",
  authCheckMiddleware,
  validate(dealerSchemeValidation.getDealerScheme),
  dealerSchemeController.getDealerScheme
);
/**
 * get documents by pincode and scheme
 */
router.get(
  "/scheme/:sid/pincode/:pid",
  authCheckMiddleware,
  validate(dealerSchemeValidation.getDealerBySchemeAndPincode),
  dealerSchemeController.getDealerBySchemeAndPincode
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(dealerSchemeValidation.getDocument),
  dealerSchemeController.getById
);

/**
 * get one document (if query) / all documents
 */
router.get(
  "/get-all/:id",
  authCheckMiddleware,
  // validate(dealerSchemeValidation.get),
  dealerSchemeController.getbydealerId
);

/**
 * get all dealerScheme pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(dealerSchemeValidation.getAllFilter),
  dealerSchemeController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(dealerSchemeValidation.create),
  dealerSchemeController.add
);

/**
 * scheme to dealer mapping
 * one scheme map to multiple dealers
 */
router.post(
  "/scheme-to-dealer-mapping",
  authCheckMiddleware,
  validate(dealerSchemeValidation.schemeToDealer),
  dealerSchemeController.schemeToDealer
);

/**
 * scheme to dealer mapping
 * one scheme map to multiple dealers
 */
router.post(
  "/dealer-to-scheme-mapping",
  authCheckMiddleware,
  validate(dealerSchemeValidation.DealerToscheme),
  dealerSchemeController.DealerToscheme
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(dealerSchemeValidation.update),
  dealerSchemeController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(dealerSchemeValidation.changeStatus),
  dealerSchemeController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(dealerSchemeValidation.deleteDocument),
  dealerSchemeController.deleteDocument
);

module.exports = router;
