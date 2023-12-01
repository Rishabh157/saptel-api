const router = require("express").Router();
const dealerController = require("./DealerController");
const validate = require("../../middleware/validate");
const dealerValidation = require("./DealerValidation");
const {
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */

router.get(
  "/company/:companyid",
  authCheckDealerMiddleware,
  validate(dealerValidation.get),
  dealerController.get
);

/**
 * pincode wise dealer
 */
router.get(
  "/company/:companyid/pincode/:pincodeid",
  authCheckDealerMiddleware,
  validate(dealerValidation.getByPincode),
  dealerController.getByPincode
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckDealerMiddleware,
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
  authCheckDealerMiddleware,
  validate(dealerValidation.getAllFilter),
  dealerController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckDealerMiddleware,
  validate(dealerValidation.create),
  dealerController.add
);

// changepassword

router.put(
  "/change-password",
  authCheckDealerMiddleware,
  validate(dealerValidation.changePasswordValid),
  dealerController.changePassword
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckDealerMiddleware,
  validate(dealerValidation.update),
  dealerController.update
);
/**
 * update autoMapping status
 */
router.put(
  "/automapping-change/:id",
  authCheckDealerMiddleware,
  validate(dealerValidation.autoMappingChange),
  dealerController.changeAutoMapping
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckDealerMiddleware,
  validate(dealerValidation.changeStatus),
  dealerController.statusChange
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckDealerMiddleware,
  validate(dealerValidation.deleteDocument),
  dealerController.deleteDocument
);

module.exports = router;
