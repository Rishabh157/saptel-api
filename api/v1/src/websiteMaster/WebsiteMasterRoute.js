const router = require("express").Router();
const websiteMasterController = require("../../controller/websiteMaster/WebsiteMasterController");
const validate = require("../../middleware/validate");
const websiteMasterValidation = require("./WebsiteMasterValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
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
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMasterValidation.get),
  websiteMasterController.get
);
/**
 * get all websiteMaster pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMasterValidation.getAllFilter),
  websiteMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMasterValidation.create),
  websiteMasterController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMasterValidation.update),
  websiteMasterController.update
);
/**
 * get by id
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMasterValidation.getById),
  websiteMasterController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMasterValidation.changeStatus),
  websiteMasterController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteMasterValidation.deleteDocument),
  websiteMasterController.deleteDocument
);

module.exports = router;
