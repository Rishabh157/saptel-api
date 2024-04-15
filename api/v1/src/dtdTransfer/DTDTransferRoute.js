const router = require("express").Router();
const dtdTransferController = require("./DTDTransferController");
const validate = require("../../middleware/validate");
const dtdTransferValidation = require("./DTDTransferValidation");

const {
  authCheckMiddleware,
  authCheckDealerMiddleware,
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

// grooup by
router.post(
  "/groupby",
  authCheckMiddleware,
  validate(dtdTransferValidation.getAllFilter),
  dtdTransferController.allFilterGroupPagination
);

// grooup by for dealer panel
router.post(
  "/dealer/groupby",
  authCheckDealerMiddleware,
  validate(dtdTransferValidation.getAllFilter),
  dtdTransferController.allFilterGroupPagination
);
/**
 * get all dtdTransfer pagination filter for dealer panel
 */

/**
 * create new document
 */
router.post(
  "/add",

  authCheckDealerMiddleware,
  validate(dtdTransferValidation.create),
  dtdTransferController.add
);
/**
 * update document
 */
router.put(
  "/update-dtd",

  authCheckMiddleware,
  validate(dtdTransferValidation.update),
  dtdTransferController.update
);

/**
 * get by id
 */
router.get(
  "/:dtdNo",

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
 * update approve
 */
router.put(
  "/approve-dtd/:dtdNo/status/:status",
  authCheckMiddleware,
  validate(dtdTransferValidation.approveStatus),
  dtdTransferController.updateApprove
);
/**
 * delete document
 */
router.delete(
  "/:dtdNo",
  authCheckMiddleware,
  validate(dtdTransferValidation.deleteDocument),
  dtdTransferController.deleteDocument
);

module.exports = router;
