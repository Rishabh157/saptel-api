const router = require("express").Router();
const dealerSupervisorController = require("../../controller/dealerSupervisor/DealerSupervisorController");
const validate = require("../../middleware/validate");
const dealerSupervisorValidation = require("../../validation/DealerSupervisorValidation");
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
    validate(dealerSupervisorValidation.create),
    dealerSupervisorController.add
);
/**
 * update document
 */
router.put(
    "/:id",
    accessModuleCheck,
    authCheckMiddleware,
    validate(dealerSupervisorValidation.update),
    dealerSupervisorController.update
);

/**
 * get all with pagination filter
 */

router.post(
    "/",
    accessModuleCheck,
    authCheckMiddleware,
    validate(dealerSupervisorValidation.getAllFilter),
    dealerSupervisorController.allFilterPagination
);

/**
 * delete document
 */
router.delete(
    "/:id",
    accessModuleCheck,
    authCheckMiddleware,
    validate(dealerSupervisorValidation.deleteDocument),
    dealerSupervisorController.deleteDocument
);

/**
 * get by id document
 */
router.get(
    "/:id",
    accessModuleCheck,
    authCheckMiddleware,
    validate(dealerSupervisorValidation.getById),
    dealerSupervisorController.getById
);


module.exports = router;
