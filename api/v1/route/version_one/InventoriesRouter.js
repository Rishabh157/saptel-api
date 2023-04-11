const router = require("express").Router();
const inventoriesController = require("../../controller/inventories/InventoriesController");
const validate = require("../../middleware/validate");
const inventoriesValidation = require("../../validation/InventoriesValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(inventoriesValidation.get),
  inventoriesController.get
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
