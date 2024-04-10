const router = require("express").Router();
const dtdTransferController = require("./DTDTransferController");
const validate = require("../../middleware/validate");
const dtdTransferValidation = require("./DTDTransferValidation");

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
  validate(dtdTransferValidation.get),
  dtdTransferController.get
);
/**
 * get all dtdTransfer pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(dtdTransferValidation.getAllFilter),
  dtdTransferController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(dtdTransferValidation.create),
  dtdTransferController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(dtdTransferValidation.update),
  dtdTransferController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(dtdTransferValidation.getById),
  dtdTransferController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(dtdTransferValidation.changeStatus),
  dtdTransferController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(dtdTransferValidation.deleteDocument),
  dtdTransferController.deleteDocument
);

module.exports = router;
