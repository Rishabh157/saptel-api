const router = require("express").Router();
const inventoriesController = require("./InventoriesController");
const validate = require("../../middleware/validate");
const inventoriesValidation = require("./InventoriesValidation");
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
  validate(inventoriesValidation.get),
  inventoriesController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(inventoriesValidation.getDocument),
  inventoriesController.getById
);
/**
 * get all inventories pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(inventoriesValidation.getAllFilter),
  inventoriesController.allFilterPagination
);

//dealer ap pagination
router.post(
  "/dealer",
  authCheckDealerMiddleware,
  validate(inventoriesValidation.getAllFilter),
  inventoriesController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(inventoriesValidation.create),
  inventoriesController.add
);
/**
 * create new document for dealer app
 */
router.post(
  "/dealer/add",
  authCheckDealerMiddleware,
  validate(inventoriesValidation.create),
  inventoriesController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(inventoriesValidation.update),
  inventoriesController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(inventoriesValidation.changeStatus),
  inventoriesController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(inventoriesValidation.deleteDocument),
  inventoriesController.deleteDocument
);

module.exports = router;
