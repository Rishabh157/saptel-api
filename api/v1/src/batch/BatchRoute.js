const router = require("express").Router();
const batchController = require("./BatchController");
const validate = require("../../middleware/validate");
const batchValidation = require("./BatchValidation");

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

  authCheckMiddleware,
  validate(batchValidation.get),
  batchController.get
);
/**
 * get all batch pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(batchValidation.getAllFilter),
  batchController.allFilterPagination
);

/**
 * get all batch order pagination filter
 */

router.get(
  "/get-batch-order/:batchid",
  authCheckMiddleware,
  batchController.getBatchOrder
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(batchValidation.create),
  batchController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(batchValidation.update),
  batchController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(batchValidation.getById),
  batchController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(batchValidation.changeStatus),
  batchController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(batchValidation.deleteDocument),
  batchController.deleteDocument
);

module.exports = router;
