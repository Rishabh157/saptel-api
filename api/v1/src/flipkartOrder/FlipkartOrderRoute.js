const router = require("express").Router();
const flipkartOrderController = require("./FlipkartOrderController");
const validate = require("../../middleware/validate");
const flipkartOrderValidation = require("./FlipkartOrderValidation");
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
  validate(flipkartOrderValidation.get),
  flipkartOrderController.get
);
/**
 * get all flipkartOrder pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(flipkartOrderValidation.getAllFilter),
  flipkartOrderController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  upload.single("file"),

  flipkartOrderController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  flipkartOrderController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(flipkartOrderValidation.getById),
  flipkartOrderController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(flipkartOrderValidation.changeStatus),
  flipkartOrderController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(flipkartOrderValidation.deleteDocument),
  flipkartOrderController.deleteDocument
);

module.exports = router;
