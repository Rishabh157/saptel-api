const router = require("express").Router();
const wareHouseController = require("./WareHouseController");
const validate = require("../../middleware/validate");
const wareHouseValidation = require("./WareHouseValidation");
const {
  authCheckMiddleware,
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid/warehouse",
  authCheckMiddleware,
  validate(wareHouseValidation.get),
  wareHouseController.getWarehouse
);

router.get(
  "/dealer/company/:companyid/warehouse",
  authCheckDealerMiddleware,
  validate(wareHouseValidation.get),
  wareHouseController.getWarehouseFromDealer
);
// warehouse of dealers
router.get(
  "/company/:companyid/dealer-warehouse",
  authCheckMiddleware,
  validate(wareHouseValidation.get),
  wareHouseController.getDealerWarehouse
);

router.get(
  "/company/:companyid/dealer/:dealerid",
  authCheckMiddleware,
  validate(wareHouseValidation.getDocumentByDealerid),
  wareHouseController.getByDealerId
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
 * get one document for dealer app
 */
router.get(
  "/dealer/:id",
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
/**
 * get all wareHouse pagination filter for warehouse warehouse
 */

router.post(
  "/all-warehouse",
  authCheckMiddleware,
  validate(wareHouseValidation.getAllFilter),
  wareHouseController.allFilterPaginationWarehouse
);
// dealer project warehouse
router.post(
  "/dealer",
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
 * create new document in dealer app
 */
router.post(
  "/dealer/add",
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
 * update document for dealer app
 */
router.put(
  "/dealer/:id",
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
