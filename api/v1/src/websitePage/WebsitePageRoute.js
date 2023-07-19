const router = require("express").Router();
const websitePageController = require("./WebsitePageController");
const validate = require("../../middleware/validate");
const websitePageValidation = require("./WebsitePageValidation");
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
  validate(websitePageValidation.get),
  websitePageController.get
);
/**
 * get all websitePage pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(websitePageValidation.getAllFilter),
  websitePageController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(websitePageValidation.create),
  websitePageController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(websitePageValidation.update),
  websitePageController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(websitePageValidation.getById),
  websitePageController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(websitePageValidation.changeStatus),
  websitePageController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(websitePageValidation.deleteDocument),
  websitePageController.deleteDocument
);

module.exports = router;
