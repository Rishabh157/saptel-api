const router = require("express").Router();
const allocationController = require("./AllocationController");
const validate = require("../../middleware/validate");
const allocationValidation = require("./AllocationValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(allocationValidation.get),
  allocationController.get
);

/**
 * get one document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(allocationValidation.getById),
  allocationController.getById
);

/**
 * get all allocation pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(allocationValidation.getAllFilter),
  allocationController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(allocationValidation.create),
  allocationController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(allocationValidation.update),
  allocationController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(allocationValidation.changeStatus),
  allocationController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(allocationValidation.deleteDocument),
  allocationController.deleteDocument
);

module.exports = router;
