const router = require("express").Router();
const tehsilController = require("./TehsilController");
const validate = require("../../middleware/validate");
const tehsilValidation = require("./TehsilValidation");
const {
  authCheckMiddleware,
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(tehsilValidation.get),
  tehsilController.get
);

/**
 * get all documents without token
 */
router.get("/inbound", validate(tehsilValidation.get), tehsilController.get);
/**
 * get all tehsil of a district
 */
router.get(
  "/get-district-tehsil/:id",
  authCheckMiddleware,
  validate(tehsilValidation.get),
  tehsilController.getTehsilByDistrict
);
/**
 * get all tehsil of a district for dealer panel
 */
router.get(
  "/dealer/get-district-tehsil/:id",
  authCheckDealerMiddleware,
  validate(tehsilValidation.get),
  tehsilController.getTehsilByDistrict
);

/**
 * get all tehsil by pincode without token
 */
router.get(
  "/get-tehsil-by-pincode/unauth/:id",
  validate(tehsilValidation.getTehsilByPincode),
  tehsilController.getTehsilByPincode
);
/**
 * get all tehsil of a district without token
 */
router.get(
  "/get-district-tehsil/unauth/:id",
  validate(tehsilValidation.get),
  tehsilController.getTehsilByDistrict
);
/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(tehsilValidation.getDocument),
  tehsilController.getById
);
/**
 * get all tehsil pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(tehsilValidation.getAllFilter),
  tehsilController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(tehsilValidation.create),
  tehsilController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(tehsilValidation.update),
  tehsilController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(tehsilValidation.changeStatus),
  tehsilController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(tehsilValidation.deleteDocument),
  tehsilController.deleteDocument
);

module.exports = router;
