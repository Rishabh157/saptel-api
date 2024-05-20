const router = require("express").Router();
const awbMasterController = require("./AwbMasterController");
const validate = require("../../middleware/validate");
const awbMasterValidation = require("./AwbMasterValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(awbMasterValidation.get),
  awbMasterController.get
);
/**
 * get all awbMaster pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(awbMasterValidation.getAllFilter),
  awbMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  upload.single("file"),
  //   validate(awbMasterValidation.create),
  awbMasterController.add
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(awbMasterValidation.getById),
  awbMasterController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(awbMasterValidation.changeStatus),
  awbMasterController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(awbMasterValidation.deleteDocument),
  awbMasterController.deleteDocument
);

module.exports = router;
