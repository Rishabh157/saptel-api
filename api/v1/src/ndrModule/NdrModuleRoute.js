const router = require("express").Router();
const ndrModuleController = require("./NdrModuleController");
const validate = require("../../middleware/validate");
const ndrModuleValidation = require("./NdrModuleValidation");

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
  validate(ndrModuleValidation.get),
  ndrModuleController.get
);
/**
 * get all ndrModule pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(ndrModuleValidation.getAllFilter),
  ndrModuleController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(ndrModuleValidation.create),
  ndrModuleController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(ndrModuleValidation.update),
  ndrModuleController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(ndrModuleValidation.getById),
  ndrModuleController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(ndrModuleValidation.changeStatus),
  ndrModuleController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(ndrModuleValidation.deleteDocument),
  ndrModuleController.deleteDocument
);

module.exports = router;
