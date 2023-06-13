const router = require("express").Router();
const assetLocationController = require("./AssetLocationController");
const validate = require("../../middleware/validate");
const assetLocationValidation = require("./AssetLocationValidation");
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
    validate(assetLocationValidation.get),
    assetLocationController.get
);

/**
 * get one document
 */
router.get(
    "/:id",
    accessModuleCheck,
    authCheckMiddleware,
    validate(assetLocationValidation.getById),
    assetLocationController.getById
);

/**
 * get all assetLocation pagination filter
 */

router.post(
    "/",
    accessModuleCheck,
    authCheckMiddleware,
    validate(assetLocationValidation.getAllFilter),
    assetLocationController.allFilterPagination
);

/**
 * create new document
 */
router.post(
    "/add",
    accessModuleCheck,
    authCheckMiddleware,
    validate(assetLocationValidation.create),
    assetLocationController.add
);
/**
 * update document
 */
router.put(
    "/:id",
    accessModuleCheck,
    authCheckMiddleware,
    validate(assetLocationValidation.update),
    assetLocationController.update
);
/**
 * update status
 */
router.put(
    "/status-change/:id",
    authCheckMiddleware,
    validate(assetLocationValidation.changeStatus),
    assetLocationController.statusChange
);
/**
 * delete document
 */
router.delete(
    "/:id",
    accessModuleCheck,
    authCheckMiddleware,
    validate(assetLocationValidation.deleteDocument),
    assetLocationController.deleteDocument
);

module.exports = router;
