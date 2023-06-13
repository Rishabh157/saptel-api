const router = require("express").Router();
const websiteBlogController = require("../../controller/websiteBlog/WebsiteBlogController");
const validate = require("../../middleware/validate");
const websiteBlogValidation = require("./WebsiteBlogValidation");
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
  validate(websiteBlogValidation.get),
  websiteBlogController.get
);
/**
 * get all websiteBlog pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteBlogValidation.getAllFilter),
  websiteBlogController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteBlogValidation.create),
  websiteBlogController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteBlogValidation.update),
  websiteBlogController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteBlogValidation.getById),
  websiteBlogController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteBlogValidation.changeStatus),
  websiteBlogController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(websiteBlogValidation.deleteDocument),
  websiteBlogController.deleteDocument
);

module.exports = router;
