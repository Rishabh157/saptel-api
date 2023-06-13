const router = require("express").Router();
const zonalManagerController = require("../../controller/zonalManager/ZonalManagerController");
const validate = require("../../middleware/validate");
const zonalManagerValidation = require("./ZonalManagerValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

/**
 * get by id document
 */
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(zonalManagerValidation.getById),
  zonalManagerController.get
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(zonalManagerValidation.create),
  zonalManagerController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(zonalManagerValidation.update),
  zonalManagerController.update
);

/**
 * get all with pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(zonalManagerValidation.getAllFilter),
  zonalManagerController.allFilterPagination
);

/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(zonalManagerValidation.deleteDocument),
  zonalManagerController.deleteDocument
);

/**
 * get by id document
 */
router.get(
  "/:id",
  accessModuleCheck,
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
