const router = require("express").Router();
const didManagementController = require("./DidManagementController");
const validate = require("../../middleware/validate");
const didManagementValidation = require("./DidManagementValidation");
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
  validate(didManagementValidation.getByDidNo),
  didManagementController.get
);

//-----------------------------------------------------
/**
 * getByDid Number
 */
router.get(
  "/unauth/:didno",
  // accessModuleCheck,
  // authCheckMiddleware,
  // validate(didManagementValidation.get),
  didManagementController.getByDidNo
);

/**
 * get all didManagement pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(didManagementValidation.getAllFilter),
  didManagementController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(didManagementValidation.create),
  didManagementController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(didManagementValidation.update),
  didManagementController.update
);

/**
 * get by id document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(didManagementValidation.getById),
  didManagementController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(didManagementValidation.changeStatus),
  didManagementController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(didManagementValidation.deleteDocument),
  didManagementController.deleteDocument
);

module.exports = router;
