const router = require("express").Router();
const goodReceivedNoteController = require("./GRNController");
const validate = require("../../middleware/validate");
const goodReceivedNoteValidation = require("./GRNValidation");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.get),
  goodReceivedNoteController.get
);

/**
 * get all by po code
 */
router.get(
  "/pocode",
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.getByPoCode),
  goodReceivedNoteController.getByPoCode
);

/**
 * get one document (if query) / all documents
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.getDocument),
  goodReceivedNoteController.getById
);
/**
 * get all goodReceivedNote pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.getAllFilter),
  goodReceivedNoteController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.create),
  goodReceivedNoteController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.update),
  goodReceivedNoteController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.changeStatus),
  goodReceivedNoteController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.deleteDocument),
  goodReceivedNoteController.deleteDocument
);

module.exports = router;
