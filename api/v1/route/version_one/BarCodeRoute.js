const router = require("express").Router();
const barCodeController = require("../../controller/barCode/BarCodeController");
const validate = require("../../middleware/validate");
const barCodeValidation = require("../../validation/BarCodeValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(barCodeValidation.get),
  barCodeController.get
);

/**
 * get by groupid
 */
router.get(
  "/all-by-group/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(barCodeValidation.getGroupId),
  barCodeController.getAllByGroup
);
/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(barCodeValidation.getDocument),
  barCodeController.getById
);
/**
 * get all barCode pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(barCodeValidation.getAllFilter),
  barCodeController.allFilterPagination
);

router.post(
  "/barcode-group",
  accessModuleCheck,
  authCheckMiddleware,
  validate(barCodeValidation.getAllFilter),
  barCodeController.allFilterGroupPagination
);
/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(barCodeValidation.create),
  barCodeController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(barCodeValidation.update),
  barCodeController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(barCodeValidation.changeStatus),
  barCodeController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(barCodeValidation.deleteDocument),
  barCodeController.deleteDocument
);

module.exports = router;
