const router = require("express").Router();
const languageController = require("./LanguageController");
const validate = require("../../middleware/validate");
const languageValidation = require("./LanguageValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(languageValidation.get),
  languageController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(languageValidation.getDocument),
  languageController.getById
);
/**
 * get all language pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(languageValidation.getAllFilter),
  languageController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(languageValidation.create),
  languageController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(languageValidation.update),
  languageController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(languageValidation.changeStatus),
  languageController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(languageValidation.deleteDocument),
  languageController.deleteDocument
);

module.exports = router;
