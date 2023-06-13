const router = require("express").Router();
const goodReceivedNoteController = require("../../controller/GRN/GRNController");
const validate = require("../../middleware/validate");
const goodReceivedNoteValidation = require("./GRNValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
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
  accessModuleCheck,
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.get),
  goodReceivedNoteController.get
);

/**
 * get one document (if query) / all documents
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.getDocument),
  goodReceivedNoteController.getById
);
/**
 * get all goodReceivedNote pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.getAllFilter),
  goodReceivedNoteController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.create),
  goodReceivedNoteController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.update),
  goodReceivedNoteController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.changeStatus),
  goodReceivedNoteController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(goodReceivedNoteValidation.deleteDocument),
  goodReceivedNoteController.deleteDocument
);

module.exports = router;
