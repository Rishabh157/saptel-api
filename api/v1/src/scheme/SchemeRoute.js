const router = require("express").Router();
const schemeController = require("./SchemeController");
const validate = require("../../middleware/validate");
const schemeValidation = require("./SchemeValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  authCheckMiddleware,
  validate(schemeValidation.get),
  schemeController.get
);
/**
 * get all documents without token for inbound calls
 */
router.get(
  "/company/:companyid/product-group/:pgid",
  validate(schemeValidation.getByProductGroup),
  schemeController.getByProductGroup
);
/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(schemeValidation.getDocument),
  schemeController.getById
);

/**
 * get one document without token
 */
router.get(
  "/inbound/:id",
  validate(schemeValidation.getDocument),
  schemeController.getById
);
/**
 * get all scheme pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(schemeValidation.getAllFilter),
  schemeController.allFilterPagination
);

/**
 * get all scheme pagination filter without token
 */

router.post(
  "/inbound",
  validate(schemeValidation.getAllFilter),
  schemeController.allFilterPagination
);
/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(schemeValidation.create),
  schemeController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(schemeValidation.update),
  schemeController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(schemeValidation.changeStatus),
  schemeController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(schemeValidation.deleteDocument),
  schemeController.deleteDocument
);

module.exports = router;
