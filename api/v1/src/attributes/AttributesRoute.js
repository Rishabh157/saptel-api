const router = require("express").Router();
const attributesController = require("./AttributesController");
const validate = require("../../middleware/validate");
const attributesValidation = require("./AttributesValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(attributesValidation.get),
  attributesController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(attributesValidation.getDocument),
  attributesController.getById
);
/**
 * get all attributes pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(attributesValidation.getAllFilter),
  attributesController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(attributesValidation.create),
  attributesController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(attributesValidation.update),
  attributesController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(attributesValidation.changeStatus),
  attributesController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(attributesValidation.deleteDocument),
  attributesController.deleteDocument
);

module.exports = router;
