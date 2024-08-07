const router = require("express").Router();
const didManagementController = require("./DidManagementController");
const validate = require("../../middleware/validate");
const didManagementValidation = require("./DidManagementValidation");
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
  validate(didManagementValidation.getByDidNo),
  didManagementController.get
);

//-----------------------------------------------------
/**
 * getByDid Number
 */
router.get(
  "/unauth/:didno/company/:companyId",
  // authCheckMiddleware,
  // validate(didManagementValidation.get),
  didManagementController.getByDidNoUnauth
);

//-----------------------------------------------------
/**
 * getByDid Number with token
 */
router.get(
  "/didno/:didno",
  authCheckMiddleware,
  // validate(didManagementValidation.get),
  didManagementController.getByDidNo
);

/**
 * get all didManagement pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(didManagementValidation.getAllFilter),
  didManagementController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(didManagementValidation.create),
  didManagementController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(didManagementValidation.update),
  didManagementController.update
);

/**
 * get by id document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(didManagementValidation.getById),
  didManagementController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(didManagementValidation.changeStatus),
  didManagementController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(didManagementValidation.deleteDocument),
  didManagementController.deleteDocument
);

module.exports = router;
