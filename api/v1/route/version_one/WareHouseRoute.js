const router = require("express").Router();
const wareHouseController = require("../../controller/wareHouse/WareHouseController");
const validate = require("../../middleware/validate");
const wareHouseValidation = require("../../validation/WareHouseValidation");
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
  validate(wareHouseValidation.get),
  wareHouseController.get
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
 * get all wareHouse pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
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
