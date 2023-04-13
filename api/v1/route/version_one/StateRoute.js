const router = require("express").Router();
const stateController = require("../../controller/state/StateController");
const validate = require("../../middleware/validate");
const stateValidation = require("../../validation/StateValidation");
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
  validate(stateValidation.get),
  stateController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(stateValidation.getDocument),
  stateController.getById
);
/**
 * get all state pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(stateValidation.getAllFilter),
  stateController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(stateValidation.create),
  stateController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(stateValidation.update),
  stateController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(stateValidation.changeStatus),
  stateController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(stateValidation.deleteDocument),
  stateController.deleteDocument
);

module.exports = router;
