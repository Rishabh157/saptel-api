const router = require("express").Router();
const transportController = require("./TransportController");
const validate = require("../../middleware/validate");
const transportValidation = require("./TransportValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(transportValidation.get),
  transportController.get
);
/**
 * get all transport pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(transportValidation.getAllFilter),
  transportController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(transportValidation.create),
  transportController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(transportValidation.update),
  transportController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(transportValidation.getById),
  transportController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(transportValidation.changeStatus),
  transportController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(transportValidation.deleteDocument),
  transportController.deleteDocument
);

module.exports = router;
