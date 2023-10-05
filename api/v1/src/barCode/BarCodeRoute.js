const router = require("express").Router();
const barCodeController = require("./BarCodeController");
const validate = require("../../middleware/validate");
const barCodeValidation = require("./BarCodeValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

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
/**
 * update document
 */
router.get(
  "/barcode/:barcode",
  authCheckMiddleware,
  validate(barCodeValidation.getBarcode),
  barCodeController.getByBarcode
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
