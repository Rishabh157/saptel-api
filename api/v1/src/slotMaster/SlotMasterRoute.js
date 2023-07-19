const router = require("express").Router();
const slotMasterController = require("./SlotMasterController");
const validate = require("../../middleware/validate");
const slotMasterValidation = require("./SlotMasterValidation");
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
  validate(slotMasterValidation.get),
  slotMasterController.get
);
/**
 * get all slotMaster pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(slotMasterValidation.getAllFilter),
  slotMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(slotMasterValidation.create),
  slotMasterController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(slotMasterValidation.update),
  slotMasterController.update
);
/**
 * get by id document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(slotMasterValidation.getById),
  slotMasterController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(slotMasterValidation.changeStatus),
  slotMasterController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(slotMasterValidation.deleteDocument),
  slotMasterController.deleteDocument
);

module.exports = router;
