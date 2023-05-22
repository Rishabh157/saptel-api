const router = require("express").Router();
const slotMasterController = require("../../controller/slotMaster/SlotMasterController");
const validate = require("../../middleware/validate");
const slotMasterValidation = require("../../validation/SlotMasterValidation");
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
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(slotMasterValidation.get),
  slotMasterController.get
);
/**
 * get all slotMaster pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(slotMasterValidation.getAllFilter),
  slotMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(slotMasterValidation.create),
  slotMasterController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(slotMasterValidation.update),
  slotMasterController.update
);
/**
 * get by id document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(slotMasterValidation.getById),
  slotMasterController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(slotMasterValidation.changeStatus),
  slotMasterController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(slotMasterValidation.deleteDocument),
  slotMasterController.deleteDocument
);

module.exports = router;
