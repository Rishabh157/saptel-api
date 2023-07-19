const router = require("express").Router();
const websiteMasterController = require("./WebsiteMasterController");
const validate = require("../../middleware/validate");
const websiteMasterValidation = require("./WebsiteMasterValidation");
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
  validate(websiteMasterValidation.get),
  websiteMasterController.get
);
/**
 * get all websiteMaster pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(websiteMasterValidation.getAllFilter),
  websiteMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(websiteMasterValidation.create),
  websiteMasterController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(websiteMasterValidation.update),
  websiteMasterController.update
);
/**
 * get by id
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(websiteMasterValidation.getById),
  websiteMasterController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(websiteMasterValidation.changeStatus),
  websiteMasterController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(websiteMasterValidation.deleteDocument),
  websiteMasterController.deleteDocument
);

module.exports = router;
