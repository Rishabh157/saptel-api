const router = require("express").Router();
const userRoleController = require("./UserRoleController");
const validate = require("../../middleware/validate");
const userRoleValidation = require("./UserRoleValidation");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(userRoleValidation.create),
  userRoleController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(userRoleValidation.update),
  userRoleController.update
);

/**
 * get all with pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(userRoleValidation.getAllFilter),
  userRoleController.allFilterPagination
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(userRoleValidation.deleteDocument),
  userRoleController.deleteDocument
);

/**
 * get by id document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(userRoleValidation.getById),
  userRoleController.getById
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(userRoleValidation.changeStatus),
  userRoleController.statusChange
);

module.exports = router;
