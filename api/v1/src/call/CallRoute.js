const router = require("express").Router();
const callController = require("./CallController");
const validate = require("../../middleware/validate");
const callValidation = require("./CallValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get("/", validate(callValidation.get), callController.get);
/**
 * get all inbound pagination filter
 */

router.post(
  "/",
  validate(callValidation.getAllFilter),
  callController.allFilterPagination
);

router.post(
  "/unauth-call",
  validate(callValidation.getAllFilter),
  callController.allFilterPaginationUnauth
);

// auth
router.post(
  "/",
  authCheckMiddleware,
  validate(callValidation.getAllFilter),
  callController.allFilterPaginationUnauth
);

/**
 * create new document
 */
router.post("/add", validate(callValidation.create), callController.add);

/**
 * create new document with token
 */
router.post(
  "/auth/add",
  authCheckMiddleware,
  validate(callValidation.create),
  callController.add
);
/**
 * update document
 */
router.put("/:id", validate(callValidation.update), callController.update);

/**
 * update document auth
 */
router.put(
  "/auth/:id",
  authCheckMiddleware,
  validate(callValidation.update),
  callController.update
);

/**
 * get by id
 */
router.get("/:id", validate(callValidation.getById), callController.getById);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  validate(callValidation.changeStatus),
  callController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  validate(callValidation.deleteDocument),
  callController.deleteDocument
);

module.exports = router;
