const router = require("express").Router();
const DealerInventoriesController = require("./DealerInventoriesController");
const validate = require("../../middleware/validate");
const DealerInventoriesValidation = require("./DealerInventoriesValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
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
  accessModuleCheck,
  authCheckMiddleware,
  validate(DealerInventoriesValidation.get),
  DealerInventoriesController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(DealerInventoriesValidation.getDocument),
  DealerInventoriesController.getById
);
/**
 * get all inventories pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(DealerInventoriesValidation.getAllFilter),
  DealerInventoriesController.allFilterPagination
);

//dealer ap pagination
router.post(
  "/dealer",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(DealerInventoriesValidation.getAllFilter),
  DealerInventoriesController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(DealerInventoriesValidation.create),
  DealerInventoriesController.add
);
/**
 * create new document for dealer app
 */
router.post(
  "/dealer/add",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(DealerInventoriesValidation.create),
  DealerInventoriesController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(DealerInventoriesValidation.update),
  DealerInventoriesController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(DealerInventoriesValidation.changeStatus),
  DealerInventoriesController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(DealerInventoriesValidation.deleteDocument),
  DealerInventoriesController.deleteDocument
);

module.exports = router;
