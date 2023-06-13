const router = require("express").Router();
const attributesGroupController = require("./AttributesGroupController");
const validate = require("../../middleware/validate");
const attributesGroupValidation = require("./AttributesGroupValidation");
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
  validate(attributesGroupValidation.get),
  attributesGroupController.get
);
/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(attributesGroupValidation.getDocument),
  attributesGroupController.getById
);
/**
 * get all attributesGroup pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(attributesGroupValidation.getAllFilter),
  attributesGroupController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(attributesGroupValidation.create),
  attributesGroupController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(attributesGroupValidation.update),
  attributesGroupController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(attributesGroupValidation.changeStatus),
  attributesGroupController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(attributesGroupValidation.deleteDocument),
  attributesGroupController.deleteDocument
);

module.exports = router;
