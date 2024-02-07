const router = require("express").Router();
const ndrLogsController = require("./NdrLogsController");
const validate = require("../../middleware/validate");
const ndrLogsValidation = require("./NdrLogsValidation");

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
  validate(ndrLogsValidation.get),
  ndrLogsController.get
);
/**
 * get all ndrLogs pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(ndrLogsValidation.getAllFilter),
  ndrLogsController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(ndrLogsValidation.create),
  ndrLogsController.add
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(ndrLogsValidation.getById),
  ndrLogsController.getById
);

module.exports = router;
