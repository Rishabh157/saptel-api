const router = require("express").Router();
const userController = require("./UserController");
const validate = require("../../middleware/validate");
const userValidation = require("./UserValidation");
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
  validate(userValidation.get),
  userController.get
);

/**
 * get one document (if query) / all documents
 */
router.get(
  "/get-batch-assignes",
  authCheckMiddleware,
  // validate(userValidation.get),
  userController.getBatchAssignes
);

/**
 * get sr zonal exicutive via zonala manager
 */
router.get(
  "/get-sr-exicutive/:zmid",
  authCheckMiddleware,
  // validate(userValidation.get),
  userController.getSrExicutive
);

/**
 * get sr zonal exicutive via zonala manager
 */
router.get(
  "/get-jr-exicutive/:zeid",
  authCheckMiddleware,
  // validate(userValidation.get),
  userController.getJrExicutive
);
/**
 * get all zonal EXECUTIVE of distribution department
 */
router.get(
  "/distribution/:role",
  authCheckMiddleware,
  validate(userValidation.getAllDistribution),
  userController.getAllDistributionUser
);

/**
 * get all floor managers
 */
router.get(
  "/get-floor-managers/company/:companyid/call-center/:callcenterid/department/:departmentid",
  authCheckMiddleware,
  validate(userValidation.getAllFloorManagersAndTeamLead),
  userController.getAllFloorManagers
);

/**
 * get all Team leads
 */
router.get(
  "/get-team-leads/company/:companyid/call-center/:callcenterid/department/:departmentid",
  authCheckMiddleware,
  validate(userValidation.getAllFloorManagersAndTeamLead),
  userController.getAllTeamLeads
);

/**
 * get all user by user role
 */
router.post(
  "/get-all-users/user-role/:userrole",
  authCheckMiddleware,
  validate(userValidation.getAllUsers),
  userController.getAllUsers
);
/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(userValidation.getAllFilter),
  userController.allFilterPagination
);

/**
 * create new document
 */
router.post("/signup", validate(userValidation.create), userController.add);

/**
 * login user via otp
 */
router.post(
  "/login",
  validate(userValidation.loginValid),
  userController.login
);

/**
 * verify otp send on mobile
 */
router.post(
  "/verify-otp",
  otpVerifyToken,
  validate(userValidation.verifyOtpValid),
  userController.verifyOtp
);
/**
 * update document
 */
router.put(
  "/update-profile",
  authCheckMiddleware,
  validate(userValidation.update),
  userController.update
);
/**
 * change password
 */
router.put(
  "/change-password",
  authCheckMiddleware,
  validate(userValidation.changePasswordValid),
  userController.changePassword
);

/**
 * change password
 */
router.put(
  "/change-password/by-admin",
  authCheckMiddleware,
  validate(userValidation.changePasswordByAdmin),
  userController.changePasswordByAdmin
);
router.put(
  "/:id",
  authCheckMiddleware,
  validate(userValidation.update),
  userController.updateUser
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(userValidation.changeStatus),
  userController.statusChange
);

/**
 * logout
 */
router.post(
  "/logout",
  // accessModuleCheck,
  authCheckMiddleware,
  userController.logout
);
/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(userValidation.getById),
  userController.getById
);

//refresh
router.post(
  "/refresh-token",
  validate(userValidation.refreshTokenValid),
  userController.refreshToken
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(userValidation.deleteDocument),
  userController.deleteDocument
);

module.exports = router;
