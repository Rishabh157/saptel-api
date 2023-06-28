const router = require("express").Router();
const wareHouseController = require("./VendorWareHouseController");
const validate = require("../../middleware/validate");
const wareHouseValidation = require("./VendorWareHouseValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
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
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.get),
  wareHouseController.get
);

/**
 * get all warehouse of a vendor
 */
router.get(
  "/company/:companyid/vendor/:vendorid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.getAllByVendorId),
  wareHouseController.getAllByVendorId
);
/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.getDocument),
  wareHouseController.getById
);
/**
 * get one document for vendor app
 */
router.get(
  "/vendor/:id",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(wareHouseValidation.getDocument),
  wareHouseController.getById
);
/**
 * get all wareHouse pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.getAllFilter),
  wareHouseController.allFilterPagination
);
// vendor project warehouse
router.post(
  "/vendor",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(wareHouseValidation.getAllFilter),
  wareHouseController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.create),
  wareHouseController.add
);
/**
 * create new document in vendor app
 */
router.post(
  "/vendor/add",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(wareHouseValidation.create),
  wareHouseController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.update),
  wareHouseController.update
);
/**
 * update document for vendor app
 */
router.put(
  "/vendor/:id",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(wareHouseValidation.update),
  wareHouseController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.changeStatus),
  wareHouseController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.deleteDocument),
  wareHouseController.deleteDocument
);

module.exports = router;
