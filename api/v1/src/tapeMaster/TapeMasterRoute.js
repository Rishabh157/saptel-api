const router = require("express").Router();
const tapeMasterController = require("./TapeMasterController");
const validate = require("../../middleware/validate");
const tapeMasterValidation = require("./TapeMasterValidation");
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
  validate(tapeMasterValidation.get),
  tapeMasterController.get
);
/**
 * get all tapeMaster pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(tapeMasterValidation.getAllFilter),
  tapeMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(tapeMasterValidation.create),
  tapeMasterController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(tapeMasterValidation.update),
  tapeMasterController.update
);
/**
 * get by id
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(tapeMasterValidation.getById),
  tapeMasterController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(tapeMasterValidation.changeStatus),
  tapeMasterController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(tapeMasterValidation.deleteDocument),
  tapeMasterController.deleteDocument
);

module.exports = router;
