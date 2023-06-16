const router = require("express").Router();
const itemController = require("./ItemController");
const validate = require("../../middleware/validate");
const itemValidation = require("./ItemValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(itemValidation.get),
  itemController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(itemValidation.getDocument),
  itemController.getById
);
/**
 * get all item pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(itemValidation.getAllFilter),
  itemController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(itemValidation.create),
  itemController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(itemValidation.update),
  itemController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(itemValidation.changeStatus),
  itemController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(itemValidation.deleteDocument),
  itemController.deleteDocument
);

module.exports = router;