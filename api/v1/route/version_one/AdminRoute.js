const router = require("express").Router();
const adminController = require("../../controller/admin/AdminController");
const validate = require("../../middleware/validate");
const adminValidation = require("../../validation/AdminValidation");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");

/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(adminValidation.get),
  adminController.get
);

/**
 * get all user pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(adminValidation.getAllFilter),
  adminController.allFilterPagination
);

/**
 * create new admin user
 */
router.post(
  "/add",
  accessModuleCheck,
  validate(adminValidation.createValid),
  adminController.add
);

/**
 * login admin via otp
 */
router.post(
  "/login",
  // accessModuleCheck,
  validate(adminValidation.loginValid),
  adminController.login
);

/**
 * verify otp send on mobile
 */
router.post(
  "/verify-otp",
  otpVerifyToken,
  // accessModuleCheck,
  validate(adminValidation.verifyOtpValid),
  adminController.verifyOtp
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(adminValidation.changeStatus),
  adminController.statusChange
);

/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(adminValidation.deleteDocument),
  adminController.deleteDocument
);

module.exports = router;
