const router = require("express").Router();
const zonalManagerController = require("./ZonalManagerController");
const validate = require("../../middleware/validate");
const zonalManagerValidation = require("./ZonalManagerValidation");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

/**
 * get by id document
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(zonalManagerValidation.getById),
  zonalManagerController.get
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(zonalManagerValidation.create),
  zonalManagerController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(zonalManagerValidation.update),
  zonalManagerController.update
);

/**
 * get all with pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(zonalManagerValidation.getAllFilter),
  zonalManagerController.allFilterPagination
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(zonalManagerValidation.deleteDocument),
  zonalManagerController.deleteDocument
);

/**
 * get by id document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(zonalManagerValidation.getById),
  zonalManagerController.getById
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(zonalManagerValidation.changeStatus),
  zonalManagerController.statusChange
);

module.exports = router;
