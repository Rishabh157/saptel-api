const router = require("express").Router();
const cartonBoxController = require("./CartonBoxController");
const validate = require("../../middleware/validate");
const cartonBoxValidation = require("./CartonBoxValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(cartonBoxValidation.get),
  cartonBoxController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(cartonBoxValidation.getDocument),
  cartonBoxController.getById
);
/**
 * get all cartonBox pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(cartonBoxValidation.getAllFilter),
  cartonBoxController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(cartonBoxValidation.create),
  cartonBoxController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(cartonBoxValidation.update),
  cartonBoxController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(cartonBoxValidation.changeStatus),
  cartonBoxController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(cartonBoxValidation.deleteDocument),
  cartonBoxController.deleteDocument
);

module.exports = router;
