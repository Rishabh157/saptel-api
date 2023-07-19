const router = require("express").Router();
const DealerInventoriesController = require("./DealerInventoriesController");
const validate = require("../../middleware/validate");
const DealerInventoriesValidation = require("./DealerInventoriesValidation");
const {
  authCheckMiddleware,
  otpVerifyToken,
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(DealerInventoriesValidation.get),
  DealerInventoriesController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(DealerInventoriesValidation.getDocument),
  DealerInventoriesController.getById
);
/**
 * get all inventories pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(DealerInventoriesValidation.getAllFilter),
  DealerInventoriesController.allFilterPagination
);

//dealer ap pagination
router.post(
  "/dealer",
  authCheckDealerMiddleware,
  validate(DealerInventoriesValidation.getAllFilter),
  DealerInventoriesController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(DealerInventoriesValidation.create),
  DealerInventoriesController.add
);
/**
 * create new document for dealer app
 */
router.post(
  "/dealer/add",
  authCheckDealerMiddleware,
  validate(DealerInventoriesValidation.create),
  DealerInventoriesController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(DealerInventoriesValidation.update),
  DealerInventoriesController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(DealerInventoriesValidation.changeStatus),
  DealerInventoriesController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(DealerInventoriesValidation.deleteDocument),
  DealerInventoriesController.deleteDocument
);

module.exports = router;
