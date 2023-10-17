const router = require("express").Router();
const wtsMasterController = require("./wtsMasterController");
const validate = require("../../middleware/validate");
const wtsMasterValidation = require("./wtsMasterValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(wtsMasterValidation.get),
  wtsMasterController.get
);
/**
 * get all wtsMaster pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(wtsMasterValidation.getAllFilter),
  wtsMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(wtsMasterValidation.create),
  wtsMasterController.add
);
/**
 * update document
 */
router.put(
  "/update-wts",
  authCheckMiddleware,
  validate(wtsMasterValidation.update),
  wtsMasterController.update
);

/**
 * get by id
 */
router.get(
  "/:wtsnumber",
  authCheckMiddleware,
  validate(wtsMasterValidation.getById),
  wtsMasterController.getByWtsNumber
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(wtsMasterValidation.changeStatus),
  wtsMasterController.statusChange
);
// grooup by
router.post(
  "/groupby",
  authCheckMiddleware,
  validate(wtsMasterValidation.getAllFilter),
  wtsMasterController.allFilterGroupPagination
);
/**
 * delete document
 */
router.delete(
  "/:wtsnumber",
  authCheckMiddleware,
  validate(wtsMasterValidation.deleteDocument),
  wtsMasterController.deleteDocument
);
/**
 * update rtv status
 */
router.put(
  "/approval-level/:wtsNumber",
  authCheckMiddleware,
  validate(wtsMasterValidation.updateApproval),
  wtsMasterController.updateLevel
);

/**
 * update wts status
 */
router.get(
  "/update-wts-status/:wtsnumber/status/:status",
  authCheckMiddleware,
  validate(wtsMasterValidation.updateWtsStatus),
  wtsMasterController.updatewtsStatus
);
module.exports = router;
