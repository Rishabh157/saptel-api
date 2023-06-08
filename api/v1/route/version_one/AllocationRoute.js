const router = require("express").Router();
const allocationController = require("../../controller/allocation/AllocationController");
const validate = require("../../middleware/validate");
const allocationValidation = require("../../validation/AllocationValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get all documents
 */
router.get(
    "/",
    accessModuleCheck,
    authCheckMiddleware,
    validate(allocationValidation.get),
    allocationController.get
);

/**
 * get one document
 */
router.get(
    "/:id",
    accessModuleCheck,
    authCheckMiddleware,
    validate(allocationValidation.getById),
    allocationController.getById
);

/**
 * get all allocation pagination filter
 */

router.post(
    "/",
    accessModuleCheck,
    authCheckMiddleware,
    validate(allocationValidation.getAllFilter),
    allocationController.allFilterPagination
);

/**
 * create new document
 */
router.post(
    "/add",
    accessModuleCheck,
    authCheckMiddleware,
    validate(allocationValidation.create),
    allocationController.add
);
/**
 * update document
 */
router.put(
    "/:id",
    accessModuleCheck,
    authCheckMiddleware,
    validate(allocationValidation.update),
    allocationController.update
);
/**
 * update status
 */
router.put(
    "/status-change/:id",
    authCheckMiddleware,
    validate(allocationValidation.changeStatus),
    allocationController.statusChange
);
/**
 * delete document
 */
router.delete(
    "/:id",
    accessModuleCheck,
    authCheckMiddleware,
    validate(allocationValidation.deleteDocument),
    allocationController.deleteDocument
);

module.exports = router;
