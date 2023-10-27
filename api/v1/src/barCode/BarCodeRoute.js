const router = require("express").Router();
const barCodeController = require("./BarCodeController");
const validate = require("../../middleware/validate");
const barCodeValidation = require("./BarCodeValidation");
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
  authCheckMiddleware,
  validate(barCodeValidation.get),
  barCodeController.get
);

/**
 * get by groupid
 */
router.get(
  "/all-by-group/:id",
  authCheckMiddleware,
  validate(barCodeValidation.getGroupId),
  barCodeController.getAllByGroup
);
/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(barCodeValidation.getDocument),
  barCodeController.getById
);
/**
 * get all barCode pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(barCodeValidation.getAllFilter),
  barCodeController.allFilterPagination
);

router.post(
  "/barcode-group",
  authCheckMiddleware,
  validate(barCodeValidation.getAllFilter),
  barCodeController.allFilterGroupPagination
);
/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(barCodeValidation.create),
  barCodeController.add
);

router.get(
  "/companyid/:cid/productgroupid/:productgroupid/barcode/:barcode/status/:status",
  authCheckMiddleware,
  validate(barCodeValidation.getBarcodeForOutward),
  barCodeController.getByBarcode
);

// barcode scan at dealer warehouse
router.get(
  "/dealer/companyid/:cid/productgroupid/:productgroupid/barcode/:barcode/status/:status",
  authCheckDealerMiddleware,
  validate(barCodeValidation.getBarcodeForOutward),
  barCodeController.getByBarcodeAtDealerWarehouse
);

router.get(
  "/getby-barcode/:barcode",
  authCheckMiddleware,
  validate(barCodeValidation.getBarcode),
  barCodeController.getBarcode
);

router.post(
  "/inventory/companyid/:cid/warehouseid/:wid/status/:status",
  authCheckMiddleware,
  validate(barCodeValidation.getInventory),
  barCodeController.getInventory
);

router.post(
  "/inventory/companyid/:cid/status/:status",
  authCheckMiddleware,
  validate(barCodeValidation.getInventoryByStatus),
  barCodeController.getInventoryByStatus
);

// dealer inventory
router.post(
  "/dealer/inventory/companyid/:cid/status/:status",
  authCheckDealerMiddleware,
  validate(barCodeValidation.getInventory),
  barCodeController.getDealerInventory
);
/**
 * update many document for invert inventory
 */
router.put(
  "/inwardinventory",
  authCheckMiddleware,
  validate(barCodeValidation.updateInventory),
  barCodeController.updateInventory
);

/**
 * update many document for invert inventory of warehouse and other company warehouse
 */
router.put(
  "/warehouse/inwardinventory",
  authCheckMiddleware,
  validate(barCodeValidation.updateWarehouseInventory),
  barCodeController.updateWarehouseInventory
);

/**
 * update many document for outward inventory
 */
router.put(
  "/outwardinventory",
  authCheckMiddleware,
  validate(barCodeValidation.outwardInventory),
  barCodeController.outwardInventory
);

// outward inventory from wtc
router.put(
  "/wtc/outwardinventory",
  authCheckMiddleware,
  validate(barCodeValidation.wtcOutwardInventory),
  barCodeController.wtcOutwardInventory
);

// outward inventory from wts
router.put(
  "/wts/outwardinventory",
  authCheckMiddleware,
  validate(barCodeValidation.wtsOutwardInventory),
  barCodeController.wtsOutwardInventory
);

// order dispatch from warehouse
router.put(
  "/order-dispatch",
  authCheckMiddleware,
  validate(barCodeValidation.orderDispatch),
  barCodeController.orderDispatch
);

// order dispatch from dealer warehouse
router.put(
  "/dealer/order-dispatch",
  authCheckDealerMiddleware,
  validate(barCodeValidation.orderDispatch),
  barCodeController.dealerOrderDispatch
);

// outward inventory from rtv
router.put(
  "/rtv/outwardinventory",
  authCheckMiddleware,
  validate(barCodeValidation.rtvOutwardInventory),
  barCodeController.rtvOutwardInventory
);

// outward inventory from wtw
router.put(
  "/wtw/outwardinventory",
  authCheckMiddleware,
  validate(barCodeValidation.wtwOutwardInventory),
  barCodeController.wtwOutwardInventory
);

/**
 * update many document for dealer inward inventory
 */
router.put(
  "/dealer-inward",
  authCheckDealerMiddleware,
  validate(barCodeValidation.dealerInwardInventory),
  barCodeController.dealerInwardInventory
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(barCodeValidation.update),
  barCodeController.update
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(barCodeValidation.changeStatus),
  barCodeController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(barCodeValidation.deleteDocument),
  barCodeController.deleteDocument
);

module.exports = router;
