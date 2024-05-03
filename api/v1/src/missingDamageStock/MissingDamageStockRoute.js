const router = require("express").Router();
const missingOrDamageStockController = require("./MissingDamageStockController");
const validate = require("../../middleware/validate");
const missingOrDamageStockValidation = require("./MissingDamageStockValidation");

const {
  authCheckMiddleware,
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckDealerMiddleware,
  validate(missingOrDamageStockValidation.get),
  missingOrDamageStockController.get
);
/**
 * get all missingOrDamageStock pagination filter
 */

router.post(
  "/",

  authCheckDealerMiddleware,
  validate(missingOrDamageStockValidation.getAllFilter),
  missingOrDamageStockController.allFilterPagination
);

/**
 * get all missingOrDamageStock pagination filter
 */

router.post(
  "/erp",

  authCheckMiddleware,
  validate(missingOrDamageStockValidation.getAllFilter),
  missingOrDamageStockController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckDealerMiddleware,
  validate(missingOrDamageStockValidation.create),
  missingOrDamageStockController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckDealerMiddleware,
  validate(missingOrDamageStockValidation.update),
  missingOrDamageStockController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckDealerMiddleware,
  validate(missingOrDamageStockValidation.getById),
  missingOrDamageStockController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckDealerMiddleware,
  validate(missingOrDamageStockValidation.changeStatus),
  missingOrDamageStockController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckDealerMiddleware,
  validate(missingOrDamageStockValidation.deleteDocument),
  missingOrDamageStockController.deleteDocument
);

module.exports = router;
