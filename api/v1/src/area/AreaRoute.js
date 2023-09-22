const router = require("express").Router();
const areaController = require("./AreaController");
const validate = require("../../middleware/validate");
const areaValidation = require("./AreaValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(areaValidation.get),
  areaController.get
);

/**
 * get all documents without token
 */
router.get("/inbound", validate(areaValidation.get), areaController.get);

/**
 * get one document
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(areaValidation.getDocument),
  areaController.getById
);

/**
 * get all area by pincode without token
 */
router.get(
  "/get-area-by-pincode/unauth/:id",
  validate(areaValidation.getAreaByPincode),
  areaController.getAreaByPincode
);
/**
 * get all area pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(areaValidation.getAllFilter),
  areaController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(areaValidation.create),
  areaController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(areaValidation.update),
  areaController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(areaValidation.changeStatus),
  areaController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(areaValidation.deleteDocument),
  areaController.deleteDocument
);

module.exports = router;
