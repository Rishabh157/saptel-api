const router = require("express").Router();
const tehsilController = require("../../controller/tehsil/TehsilController");
const validate = require("../../middleware/validate");
const tehsilValidation = require("../../validation/TehsilValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  accessModuleCheck,
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
  accessModuleCheck,
  authCheckMiddleware,
  validate(tehsilValidation.get),
  tehsilController.getTehsilByDistrict
);

/**
 * get all tehsil of a district without token
 */
router.get(
  "/get-district-tehsil/inbound:id",

  validate(tehsilValidation.get),
  tehsilController.getTehsilByDistrict
);
/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(tehsilValidation.getDocument),
  tehsilController.getById
);
/**
 * get all tehsil pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(tehsilValidation.getAllFilter),
  tehsilController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(tehsilValidation.create),
  tehsilController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(tehsilValidation.update),
  tehsilController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(tehsilValidation.changeStatus),
  tehsilController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(tehsilValidation.deleteDocument),
  tehsilController.deleteDocument
);

module.exports = router;
