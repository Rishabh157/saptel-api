const router = require("express").Router();
const barCodeController = require("./BarCodeController");
const validate = require("../../middleware/validate");
const barCodeValidation = require("./BarCodeValidation");
const {
  authCheckMiddleware,
  authCheckDealerMiddleware,
  authCheckDeliveryBoyMiddleware,
} = require("../../middleware/authenticationCheck");

/**
 * return true if barcode is valid
 */
router.post(
  "/check-barcode-and-update-status",
  authCheckDeliveryBoyMiddleware,
  validate(barCodeValidation.checkBarcode),
  barCodeController.checkBarcode
);

/**
 * return true if barcode is valid
 */
router.put(
  "/dealer/check-barcode-and-update-status",
  authCheckDealerMiddleware,
  validate(barCodeValidation.checkBarcode),
  barCodeController.checkBarcodeDealerApp
);

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
  "/productgroupid/:productgroupid/barcode/:barcode/status/:status",
  authCheckMiddleware,
  validate(barCodeValidation.getBarcodeForOutward),
  barCodeController.getByBarcode
);

router.get(
  "/outer-box-barcode/:barcode",
  authCheckMiddleware,
  // validate(barCodeValidation.getBarcodeForOutward),
  barCodeController.getByOuterBoxBarcode
);

// barcode scan at dealer warehouse
router.get(
  "/dealer/productgroupid/:productgroupid/barcode/:barcode/status/:status",
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

router.get(
  "/get-warehouse-barcode/:barcode",
  authCheckMiddleware,
  validate(barCodeValidation.getBarcode),
  barCodeController.getWhBarcode
);

router.get(
  "/dispatch-warehouse-order-barcode/:wid/barcode/:barcode/status/:status",
  authCheckMiddleware,
  validate(barCodeValidation.getDispatchBarcode),
  barCodeController.getDispatchBarcode
);

router.post(
  "/inventory/companyid/:cid/warehouseid/:wid/status/:status",
  authCheckMiddleware,
  validate(barCodeValidation.getInventory),
  barCodeController.getInventory
);
// for dealer

router.post(
  "/dealer/inventory/status/:status",
  authCheckDealerMiddleware,
  validate(barCodeValidation.getInventoryByStatus),
  barCodeController.getInventoryByStatusForDealer
);

router.post(
  "/inventory/companyid/:cid/status/:status",
  authCheckMiddleware,
  validate(barCodeValidation.getInventoryByStatus),
  barCodeController.getInventoryByStatus
);
/**
 * get dealer inventory for ZEH
 */
router.post(
  "/get-dealer-inventory",
  authCheckMiddleware,
  validate(barCodeValidation.getAllFilter),
  barCodeController.getDealerInventoryForZEH
);

// dealer inventory
router.post(
  "/dealer-inventory",
  authCheckDealerMiddleware,
  validate(barCodeValidation.getAllFilter),
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
 * dealer inward DTD transfer
 */
router.put(
  "/dealer/warehouse/inwardinventory",
  authCheckDealerMiddleware,
  validate(barCodeValidation.updateWarehouseInventoryDealer),
  barCodeController.updateWarehouseInventoryDealer
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
  "/dealer/assign-delivery-boy/order",
  authCheckDealerMiddleware,
  validate(barCodeValidation.assignDeliveryBoy),
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

// outward inventory from dtd
router.put(
  "/dealer/dtd/outwardinventory",
  authCheckDealerMiddleware,
  validate(barCodeValidation.dtdOutwardInventory),
  barCodeController.dtdOutwardInventory
);

// outward inventory from dtw
router.put(
  "/dealer/dtw/outwardinventory",
  authCheckDealerMiddleware,
  validate(barCodeValidation.dtwOutwardInventory),
  barCodeController.dtwOutwardInventory
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
 * update status
 */
router.put(
  "/courier-return-product/:id/condition/:condition/warehouse/:whid",
  authCheckMiddleware,
  validate(barCodeValidation.courierReturn),
  barCodeController.courierReturnProduct
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
