const router = require("express").Router();
const ndrDispositionController = require("./NdrDispositionController");
const validate = require("../../middleware/validate");
const ndrDispositionValidation = require("./NdrDispositionValidation");

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
  validate(ndrDispositionValidation.get),
  ndrDispositionController.get
);

//-----------------------------------------------------
/**
 * get one document (if query) / all documents unauth
 */
router.get(
  "/unauth",

  validate(ndrDispositionValidation.get),
  ndrDispositionController.get
);
/**
 * get all ndrDisposition pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(ndrDispositionValidation.getAllFilter),
  ndrDispositionController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(ndrDispositionValidation.create),
  ndrDispositionController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(ndrDispositionValidation.update),
  ndrDispositionController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(ndrDispositionValidation.getById),
  ndrDispositionController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(ndrDispositionValidation.changeStatus),
  ndrDispositionController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(ndrDispositionValidation.deleteDocument),
  ndrDispositionController.deleteDocument
);

module.exports = router;
