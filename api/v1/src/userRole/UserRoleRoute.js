const router = require("express").Router();
const userRoleController = require("../../controller/userRole/UserRoleController");
const validate = require("../../middleware/validate");
const userRoleValidation = require("./UserRoleValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const {
    authCheckMiddleware,
    otpVerifyToken,
} = require("../../middleware/authenticationCheck");


/**
 * create new document
 */
router.post(
    "/add",
    accessModuleCheck,
    authCheckMiddleware,
    validate(userRoleValidation.create),
    userRoleController.add
);
/**
 * update document
 */
router.put(
    "/:id",
    accessModuleCheck,
    authCheckMiddleware,
    validate(userRoleValidation.update),
    userRoleController.update
);

/**
 * get all with pagination filter
 */

router.post(
    "/",
    accessModuleCheck,
    authCheckMiddleware,
    validate(userRoleValidation.getAllFilter),
    userRoleController.allFilterPagination
);

/**
 * delete document
 */
router.delete(
    "/:id",
    accessModuleCheck,
    authCheckMiddleware,
    validate(userRoleValidation.deleteDocument),
    userRoleController.deleteDocument
);

/**
 * get by id document
 */
router.get(
    "/:id",
    accessModuleCheck,
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
