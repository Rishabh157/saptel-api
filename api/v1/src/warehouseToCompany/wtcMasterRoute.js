const router = require("express").Router();
const wtcMasterController = require("./wtcMasterController");
const validate = require("../../middleware/validate");
const wtcMasterValidation = require("./wtcMasterValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(wtcMasterValidation.get),
  wtcMasterController.get
);
/**
 * get all wtcMaster pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(wtcMasterValidation.getAllFilter),
  wtcMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(wtcMasterValidation.create),
  wtcMasterController.add
);
/**
 * update document
 */
router.put(
  "/update-wtc",
  authCheckMiddleware,
  validate(wtcMasterValidation.update),
  wtcMasterController.update
);

/**
 * get by id
 */
router.get(
  "/:wtcnumber",
  authCheckMiddleware,
  validate(wtcMasterValidation.getById),
  wtcMasterController.getByWtcNumber
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(wtcMasterValidation.changeStatus),
  wtcMasterController.statusChange
);
// grooup by
router.post(
  "/groupby",
  authCheckMiddleware,
  validate(wtcMasterValidation.getAllFilter),
  wtcMasterController.allFilterGroupPagination
);
/**
 * delete document
 */
router.delete(
  "/:wtcnumber",
  authCheckMiddleware,
  validate(wtcMasterValidation.deleteDocument),
  wtcMasterController.deleteDocument
);

router.put(
  "/approval-level/:wtcNumber",
  authCheckMiddleware,
  validate(wtcMasterValidation.updateApproval),
  wtcMasterController.updateLevel
);

/**
 * update rtv status
 */
router.get(
  "/update-wtc-status/:wtcnumber/status/:status",
  authCheckMiddleware,
  validate(wtcMasterValidation.updateWtcStatus),
  wtcMasterController.updatewtcStatus
);

module.exports = router;
