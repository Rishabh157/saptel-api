const router = require("express").Router();
const dealerController = require("./DealerController");
const validate = require("../../middleware/validate");
const dealerValidation = require("./DealerValidation");
const {
  authCheckMiddleware,
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(dealerValidation.get),
  dealerController.get
);

/**
 * get all dealer of zonal manager and exicutive
 */
router.get(
  "/get-zme-dealers",
  authCheckMiddleware,
  // validate(dealerValidation.get),
  dealerController.getZmeDealers
);

/**
 * get one document (if query) / all documents
 */
router.get(
  "/scheme-wise-dealer/:schemeId",
  authCheckMiddleware,
  validate(dealerValidation.getSchemeWiseDealer),
  dealerController.getSchemeWiseDealer
);

router.put(
  "/change-password",
  authCheckDealerMiddleware,
  validate(dealerValidation.changePasswordValid),
  dealerController.changePassword
);

// admin can change dealer password
router.put(
  "/change-dealer-password",
  authCheckMiddleware,
  validate(dealerValidation.changeDealerPassword),
  dealerController.changeDealerPassword
);

/**
 * pincode wise dealer
 */
router.get(
  "/company/:companyid/pincode/:pincodeid",
  authCheckMiddleware,
  validate(dealerValidation.getByPincode),
  dealerController.getByPincode
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(dealerValidation.getDocument),
  dealerController.getById
);
/**
 * get all dealer pagination filter
 */
/**
 * login dealer
 */
router.post(
  "/login",
  validate(dealerValidation.loginValid),
  dealerController.login
);
router.post(
  "/refresh",
  validate(dealerValidation.refreshTokenValid),
  dealerController.refreshToken
);
router.post(
  "/",
  authCheckMiddleware,
  validate(dealerValidation.getAllFilter),
  dealerController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(dealerValidation.create),
  dealerController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(dealerValidation.update),
  dealerController.update
);
/**
 * update autoMapping status
 */
router.put(
  "/automapping-change/:id",
  authCheckMiddleware,
  validate(dealerValidation.autoMappingChange),
  dealerController.changeAutoMapping
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(dealerValidation.changeStatus),
  dealerController.statusChange
);

/**
 * update dealer approval
 */
router.put(
  "/dealer-approve/:id",
  authCheckMiddleware,
  validate(dealerValidation.changeStatus),
  dealerController.dealerApproval
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(dealerValidation.deleteDocument),
  dealerController.deleteDocument
);

module.exports = router;
