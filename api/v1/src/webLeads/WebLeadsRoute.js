const router = require("express").Router();
const websitePageController = require("./WebLeadsController");
const validate = require("../../middleware/validate");
const webLeadsValidation = require("./WebLeadsValidation");
const {
  authCheckMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * pagination
 */
router.post(
  "/",
  authCheckMiddleware,
  validate(webLeadsValidation.getAllFilter),
  websitePageController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  // authCheckMiddleware,
  validate(webLeadsValidation.create),
  websitePageController.add
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(webLeadsValidation.update),
  websitePageController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(webLeadsValidation.getById),
  websitePageController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(webLeadsValidation.changeStatus),
  websitePageController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(webLeadsValidation.deleteDocument),
  websitePageController.deleteDocument
);

module.exports = router;
