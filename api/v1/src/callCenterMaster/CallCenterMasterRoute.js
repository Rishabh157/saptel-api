const router = require("express").Router();
const callCenterMasterController = require("./CallCenterMasterController");
const validate = require("../../middleware/validate");
const callCenterMasterValidation = require("./CallCenterMasterValidation");

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
  validate(callCenterMasterValidation.get),
  callCenterMasterController.get
);
/**
 * get all callCenterMaster pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(callCenterMasterValidation.getAllFilter),
  callCenterMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(callCenterMasterValidation.create),
  callCenterMasterController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(callCenterMasterValidation.update),
  callCenterMasterController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(callCenterMasterValidation.getById),
  callCenterMasterController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(callCenterMasterValidation.changeStatus),
  callCenterMasterController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(callCenterMasterValidation.deleteDocument),
  callCenterMasterController.deleteDocument
);

module.exports = router;
