const router = require("express").Router();
const courierRTOController = require("./CourierRTOController");
const validate = require("../../middleware/validate");
const courierRTOValidation = require("./CourierRTOValidation");

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
  validate(courierRTOValidation.get),
  courierRTOController.get
);
/**
 * get all courierRTO pagination filter
 */

router.post(
  "/",

  //   authCheckMiddleware,
  validate(courierRTOValidation.getAllFilter),
  courierRTOController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(courierRTOValidation.create),
  courierRTOController.add
);

//count api
router.post(
  "/get-courier-return-status/:wid",
  authCheckMiddleware,
  validate(courierRTOValidation.courierReturn),
  courierRTOController.courierReturn
);
/**
 * create new document bulk upload
 */
router.post(
  "/bulk-upload/warehouseId/:warehouseId",

  authCheckMiddleware,
  upload.single("file"),
  //   validate(awbMasterValidation.create),
  courierRTOController.bulkUpload
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(courierRTOValidation.update),
  courierRTOController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(courierRTOValidation.getById),
  courierRTOController.getById
);
/**
 * update status
 */
router.put(
  "/chnage-request-status/:id",

  authCheckMiddleware,
  validate(courierRTOValidation.changeStatus),
  courierRTOController.statusChange
);

/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(courierRTOValidation.deleteDocument),
  courierRTOController.deleteDocument
);

module.exports = router;
