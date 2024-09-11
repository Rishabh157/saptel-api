const router = require("express").Router();
const amazonOrderController = require("./AmazonOrderController");
const validate = require("../../middleware/validate");
const amazonOrderValidation = require("./AmazonOrderValidation");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(amazonOrderValidation.get),
  amazonOrderController.get
);
/**
 * get all amazonOrder pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(amazonOrderValidation.getAllFilter),
  amazonOrderController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  upload.single("file"),
  //   validate(amazonOrderValidation.create),
  amazonOrderController.add
);

/**
 * update status
 */
router.post(
  "/update-status",

  authCheckMiddleware,
  upload.single("file"),
  //   validate(amazonOrderValidation.create),
  amazonOrderController.updateStatus
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(amazonOrderValidation.update),
  amazonOrderController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(amazonOrderValidation.getById),
  amazonOrderController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(amazonOrderValidation.changeStatus),
  amazonOrderController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(amazonOrderValidation.deleteDocument),
  amazonOrderController.deleteDocument
);

module.exports = router;
