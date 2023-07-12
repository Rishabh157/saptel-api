const router = require("express").Router();
const userAccessController = require("./UserAccessController");
const validate = require("../../middleware/validate");
const userAccessValidation = require("./UserAccessValidation");
// const { } = require("../../middleware/);
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(userAccessValidation.get),
  userAccessController.get
);
/**
 * get all userAccess pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(userAccessValidation.getAllFilter),
  userAccessController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(userAccessValidation.create),
  userAccessController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(userAccessValidation.update),
  userAccessController.update
);

/**
 * update all by departmentId
 */
router.put(
  "/user-role/:id",

  authCheckMiddleware,
  validate(userAccessValidation.userRoleUpdate),
  userAccessController.userRoleUpdate
);
/**
 * get by id
 */
router.get(
  "/:userRoleId/userId/:userId",

  authCheckMiddleware,
  validate(userAccessValidation.getById),
  userAccessController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(userAccessValidation.changeStatus),
  userAccessController.statusChange
);

/**
 * is user exists
 */
router.get(
  "/user-exists/:id",

  authCheckMiddleware,
  validate(userAccessValidation.userExists),
  userAccessController.isUserExists
);

/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(userAccessValidation.deleteDocument),
  userAccessController.deleteDocument
);

module.exports = router;
