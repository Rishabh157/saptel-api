const router = require("express").Router();
const dispositionOneController = require("./DispositionOneController");
const validate = require("../../middleware/validate");
const dispositionOneValidation = require("./DispositionOneValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
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
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionOneValidation.get),
  dispositionOneController.get
);
/**
 * get all dispositionOne pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionOneValidation.getAllFilter),
  dispositionOneController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionOneValidation.create),
  dispositionOneController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionOneValidation.update),
  dispositionOneController.update
);

//-----------------------------------------------------
/**
/**
 * get one document (if query) / all documents (without token)
 */
router.get(
  "/unauth/get-all",
  validate(dispositionOneValidation.get),
  dispositionOneController.get
);
/**
/**
 * get by id
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionOneValidation.getById),
  dispositionOneController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionOneValidation.changeStatus),
  dispositionOneController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(dispositionOneValidation.deleteDocument),
  dispositionOneController.deleteDocument
);

module.exports = router;
