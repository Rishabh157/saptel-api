const router = require("express").Router();
const validate = require("../../middleware/validate");
const fileManagerValidation = require("./FileManagerValidation");
const fileManagerController = require("./FileManagerController");
const multerFile = require("../../middleware/multerMiddleware");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(fileManagerValidation.get),
  fileManagerController.get
);

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(fileManagerValidation.getAllFilter),
  fileManagerController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  multerFile.fileUpload.array("fileUrl", 1),
  fileManagerValidation.fileExistCheck,
  validate(fileManagerValidation.create),
  fileManagerController.add
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  multerFile.fileUpload.array("fileUrl", 1),
  fileManagerValidation.fileExistCheck,
  validate(fileManagerValidation.update),
  fileManagerController.update
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(fileManagerValidation.changeStatus),
  fileManagerController.statusChange
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(fileManagerValidation.deleteDocument),
  fileManagerController.deleteDocument
);

module.exports = router;
