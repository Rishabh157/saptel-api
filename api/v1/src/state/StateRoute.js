const router = require("express").Router();
const stateController = require("./StateController");
const validate = require("../../middleware/validate");
const stateValidation = require("./StateValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(stateValidation.get),
  stateController.get
);

/**
 * get all documents without token
 */
router.get("/inbound", validate(stateValidation.get), stateController.get);
/**
 * get all state's of a country
 */
router.get(
  "/get-country-state/:id",
  authCheckMiddleware,
  validate(stateValidation.get),
  stateController.getStateByCountry
);

/**
 * get all state's of a country without token
 */
router.get(
  "/get-country-state/inbound/:id",
  validate(stateValidation.get),
  stateController.getStateByCountry
);

/**
 * get all state by pincode without token
 */
router.get(
  "/get-state-by-pincode/unauth/:id",
  validate(stateValidation.getStateByPincode),
  stateController.getStateByPincode
);

/**
 * get all state by pincode without token
 */
router.get(
  "/get-all-by-pincode/unauth/:pincode",
  validate(stateValidation.getallByPincode),
  stateController.getAllByPincode
);
/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(stateValidation.getDocument),
  stateController.getById
);
/**
 * get all state pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(stateValidation.getAllFilter),
  stateController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(stateValidation.create),
  stateController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(stateValidation.update),
  stateController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(stateValidation.changeStatus),
  stateController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(stateValidation.deleteDocument),
  stateController.deleteDocument
);

module.exports = router;
