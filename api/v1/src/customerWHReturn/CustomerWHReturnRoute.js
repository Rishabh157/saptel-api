const router = require("express").Router();
const customerWHReturnController = require("./CustomerWHReturnController");
const validate = require("../../middleware/validate");
const customerWHReturnValidation = require("./CustomerWHReturnValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(customerWHReturnValidation.get),
  customerWHReturnController.get
);
/**
 * get all customerWHReturn pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(customerWHReturnValidation.getAllFilter),
  customerWHReturnController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(customerWHReturnValidation.create),
  customerWHReturnController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(customerWHReturnValidation.update),
  customerWHReturnController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(customerWHReturnValidation.getById),
  customerWHReturnController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(customerWHReturnValidation.changeStatus),
  customerWHReturnController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(customerWHReturnValidation.deleteDocument),
  customerWHReturnController.deleteDocument
);

module.exports = router;
