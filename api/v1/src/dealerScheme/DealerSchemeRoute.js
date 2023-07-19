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
