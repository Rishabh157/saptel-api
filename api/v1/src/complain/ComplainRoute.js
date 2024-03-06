const router = require("express").Router();
const complainController = require("./ComplainController");
const validate = require("../../middleware/validate");
const complainValidation = require("./ComplainValidation");

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
  validate(complainValidation.get),
  complainController.get
);
/**
 * get by number
 */
router.get(
  "/get-by-number/:number",
  authCheckMiddleware,
  // validate(complainValidation.getByNumber),
  complainController.getByNumber
);
/**
 * get all complain pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(complainValidation.getAllFilter),
  complainController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(complainValidation.create),
  complainController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(complainValidation.update),
  complainController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(complainValidation.getById),
  complainController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(complainValidation.changeStatus),
  complainController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(complainValidation.deleteDocument),
  complainController.deleteDocument
);

module.exports = router;
