const router = require("express").Router();
const websiteBlogController = require("./WebsiteBlogController");
const validate = require("../../middleware/validate");
const websiteBlogValidation = require("./WebsiteBlogValidation");
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
  validate(websiteBlogValidation.get),
  websiteBlogController.get
);
/**
 * get all websiteBlog pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(websiteBlogValidation.getAllFilter),
  websiteBlogController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(websiteBlogValidation.create),
  websiteBlogController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(websiteBlogValidation.update),
  websiteBlogController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(websiteBlogValidation.getById),
  websiteBlogController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(websiteBlogValidation.changeStatus),
  websiteBlogController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(websiteBlogValidation.deleteDocument),
  websiteBlogController.deleteDocument
);

module.exports = router;
