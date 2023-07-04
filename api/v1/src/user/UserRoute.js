const router = require("express").Router();
const userController = require("./UserController");
const validate = require("../../middleware/validate");
const userValidation = require("./UserValidation");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");

//-----------------------------------------------------

/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(userValidation.get),
  userController.get
);

/**
 * get all zonal exicutive of distribution department
 */
router.get(
  "/company/:companyid/distribution/:role",
  accessModuleCheck,
  authCheckMiddleware,
  validate(userValidation.getAllDistribution),
  userController.gatAllDistributionUser
);
/**
 * get all user pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(userValidation.getAllFilter),
  userController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/signup",
  accessModuleCheck,
  validate(userValidation.create),
  userController.add
);

/**
 * login user via otp
 */
router.post(
  "/login",
  accessModuleCheck,
  validate(userValidation.loginValid),
  userController.login
);

/**
 * verify otp send on mobile
 */
router.post(
  "/verify-otp",
  accessModuleCheck,
  otpVerifyToken,
  validate(userValidation.verifyOtpValid),
  userController.verifyOtp
);
/**
 * update document
 */
router.put(
  "/update-profile",
  accessModuleCheck,
  authCheckMiddleware,
  validate(userValidation.update),
  userController.update
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(userValidation.changeStatus),
  userController.statusChange
);

/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(userValidation.deleteDocument),
  userController.deleteDocument
);

module.exports = router;
