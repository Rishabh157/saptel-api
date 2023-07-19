const router = require("express").Router();
const dealersCategoryController = require("./DealersCategoryController");
const validate = require("../../middleware/validate");
const dealersCategoryValidation = require("./DealersCategoryValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(dealersCategoryValidation.get),
  dealersCategoryController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(dealersCategoryValidation.getDocument),
  dealersCategoryController.getById
);
/**
 * get all dealersCategory pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(dealersCategoryValidation.getAllFilter),
  dealersCategoryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(dealersCategoryValidation.create),
  dealersCategoryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(dealersCategoryValidation.update),
  dealersCategoryController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(dealersCategoryValidation.changeStatus),
  dealersCategoryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(dealersCategoryValidation.deleteDocument),
  dealersCategoryController.deleteDocument
);

module.exports = router;
