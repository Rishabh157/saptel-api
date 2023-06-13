const router = require("express").Router();
const inventoriesController = require("../../controller/inventories/InventoriesController");
const validate = require("../../middleware/validate");
const inventoriesValidation = require("./InventoriesValidation");
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
  validate(inventoriesValidation.get),
  inventoriesController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(inventoriesValidation.getDocument),
  inventoriesController.getById
);
/**
 * get all inventories pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(inventoriesValidation.getAllFilter),
  inventoriesController.allFilterPagination
);

//dealer ap pagination
router.post(
  "/dealer",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(inventoriesValidation.getAllFilter),
  inventoriesController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(inventoriesValidation.create),
  inventoriesController.add
);
/**
 * create new document for dealer app
 */
router.post(
  "/dealer/add",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(inventoriesValidation.create),
  inventoriesController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(inventoriesValidation.update),
  inventoriesController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(inventoriesValidation.changeStatus),
  inventoriesController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(inventoriesValidation.deleteDocument),
  inventoriesController.deleteDocument
);

module.exports = router;
