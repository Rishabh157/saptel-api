const router = require("express").Router();
const websitePageController = require("../../controller/websitePage/WebsitePageController");
const validate = require("../../middleware/validate");
const websitePageValidation = require("../../validation/WebsitePageValidation");
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
  "/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websitePageValidation.get),
  websitePageController.get
);
/**
 * get all websitePage pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websitePageValidation.getAllFilter),
  websitePageController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websitePageValidation.create),
  websitePageController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websitePageValidation.update),
  websitePageController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websitePageValidation.getById),
  websitePageController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websitePageValidation.changeStatus),
  websitePageController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websitePageValidation.deleteDocument),
  websitePageController.deleteDocument
);

module.exports = router;
