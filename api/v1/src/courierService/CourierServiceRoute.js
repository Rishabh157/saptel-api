const router = require("express").Router();
const courierServiceController = require("./CourierServiceController");
const validate = require("../../middleware/validate");
const courierServiceValidation = require("./CourierServiceValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(courierServiceValidation.get),
  courierServiceController.get
);
/**
 * get all courierService pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(courierServiceValidation.getAllFilter),
  courierServiceController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/get-est-time",

  authCheckMiddleware,
  validate(courierServiceValidation.create),
  courierServiceController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(courierServiceValidation.update),
  courierServiceController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(courierServiceValidation.getById),
  courierServiceController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(courierServiceValidation.changeStatus),
  courierServiceController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(courierServiceValidation.deleteDocument),
  courierServiceController.deleteDocument
);

module.exports = router;
