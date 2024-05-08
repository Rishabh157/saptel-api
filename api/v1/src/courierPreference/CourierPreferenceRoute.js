const router = require("express").Router();
const courierPreferenceController = require("./CourierPreferenceController");
const validate = require("../../middleware/validate");
const courierPreferenceValidation = require("./CourierPreferenceValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(courierPreferenceValidation.get),
  courierPreferenceController.get
);
/**
 * get all courierPreference pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(courierPreferenceValidation.getAllFilter),
  courierPreferenceController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(courierPreferenceValidation.create),
  courierPreferenceController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(courierPreferenceValidation.update),
  courierPreferenceController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(courierPreferenceValidation.getById),
  courierPreferenceController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(courierPreferenceValidation.changeStatus),
  courierPreferenceController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(courierPreferenceValidation.deleteDocument),
  courierPreferenceController.deleteDocument
);

module.exports = router;
