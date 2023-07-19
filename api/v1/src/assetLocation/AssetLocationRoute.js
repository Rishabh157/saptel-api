const router = require("express").Router();
const assetLocationController = require("./AssetLocationController");
const validate = require("../../middleware/validate");
const assetLocationValidation = require("./AssetLocationValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(assetLocationValidation.get),
  assetLocationController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(assetLocationValidation.getById),
  assetLocationController.getById
);

/**
 * get all assetLocation pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(assetLocationValidation.getAllFilter),
  assetLocationController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(assetLocationValidation.create),
  assetLocationController.add
);
/**
 * update document
 */
router.put(
  "/:id",
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
  authCheckMiddleware,
  validate(assetLocationValidation.deleteDocument),
  assetLocationController.deleteDocument
);

module.exports = router;
