const router = require("express").Router();
const dealersCategoryController = require("../../controller/dealersCategory/DealersCategoryController");
const validate = require("../../middleware/validate");
const dealersCategoryValidation = require("../../validation/DealersCategoryValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealersCategoryValidation.get),
  dealersCategoryController.get
);
/**
 * get all dealersCategory pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealersCategoryValidation.getAllFilter),
  dealersCategoryController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealersCategoryValidation.create),
  dealersCategoryController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealersCategoryValidation.update),
  dealersCategoryController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealersCategoryValidation.changeStatus),
  dealersCategoryController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dealersCategoryValidation.deleteDocument),
  dealersCategoryController.deleteDocument
);

module.exports = router;
