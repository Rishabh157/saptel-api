const router = require("express").Router();
const complainLogsController = require("./ComplainLogsController");
const validate = require("../../middleware/validate");
const complainLogsValidation = require("./ComplainLogsValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(complainLogsValidation.get),
  complainLogsController.get
);
/**
 * get all complainLogs pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(complainLogsValidation.getAllFilter),
  complainLogsController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(complainLogsValidation.create),
  complainLogsController.add
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(complainLogsValidation.getById),
  complainLogsController.getById
);

module.exports = router;
