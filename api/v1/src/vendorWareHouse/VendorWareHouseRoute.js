const router = require("express").Router();
const wareHouseController = require("./VendorWareHouseController");
const validate = require("../../middleware/validate");
const wareHouseValidation = require("./VendorWareHouseValidation");
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
  authCheckMiddleware,
  validate(wareHouseValidation.get),
  wareHouseController.get
);

/**
 * get all warehouse of a vendor
 */
router.get(
  "/company/:companyid/vendor/:vendorid",
  authCheckMiddleware,
  validate(wareHouseValidation.getAllByVendorId),
  wareHouseController.getAllByVendorId
);
/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(wareHouseValidation.getDocument),
  wareHouseController.getById
);
/**
 * get one document for vendor app
 */
router.get(
  "/vendor/:id",
  authCheckDealerMiddleware,
  validate(wareHouseValidation.getDocument),
  wareHouseController.getById
);
/**
 * get all wareHouse pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(wareHouseValidation.getAllFilter),
  wareHouseController.allFilterPagination
);
// vendor project warehouse
router.post(
  "/vendor",
  authCheckDealerMiddleware,
  validate(wareHouseValidation.getAllFilter),
  wareHouseController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(wareHouseValidation.create),
  wareHouseController.add
);
/**
 * create new document in vendor app
 */
router.post(
  "/vendor/add",
  authCheckDealerMiddleware,
  validate(wareHouseValidation.create),
  wareHouseController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(wareHouseValidation.update),
  wareHouseController.update
);
/**
 * update document for vendor app
 */
router.put(
  "/vendor/:id",
  authCheckDealerMiddleware,
  validate(wareHouseValidation.update),
  wareHouseController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(wareHouseValidation.changeStatus),
  wareHouseController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(wareHouseValidation.deleteDocument),
  wareHouseController.deleteDocument
);

module.exports = router;
