const router = require("express").Router();
const dtwMasterController = require("./dtwMasterController");
const validate = require("../../middleware/validate");
const dtwMasterValidation = require("./dtwMasterValidation");
const {
  authCheckDealerMiddleware,
  authCheckMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/dealer/",
  authCheckDealerMiddleware,
  validate(dtwMasterValidation.get),
  dtwMasterController.get
);
/**
 * get all dtwMaster pagination filter
 */

router.post(
  "/dealer/",
  authCheckDealerMiddleware,
  validate(dtwMasterValidation.getAllFilter),
  dtwMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/dealer/add",
  authCheckDealerMiddleware,
  validate(dtwMasterValidation.create),
  dtwMasterController.add
);
/**
 * update document
 */
router.put(
  "/dealer/update-dtw",
  authCheckDealerMiddleware,
  validate(dtwMasterValidation.update),
  dtwMasterController.update
);

/**
 * get by id
 */
router.get(
  "/dealer/:dtwnumber",
  authCheckDealerMiddleware,
  validate(dtwMasterValidation.getById),
  dtwMasterController.getById
);
/**
 * update status
 */
router.put(
  "/dealer/status-change/:id",
  authCheckDealerMiddleware,
  validate(dtwMasterValidation.changeStatus),
  dtwMasterController.statusChange
);
// grooup by
router.post(
  "/dealer/groupby",
  authCheckDealerMiddleware,
  validate(dtwMasterValidation.getAllFilter),
  dtwMasterController.allFilterGroupPagination
);

// erp
router.post(
  "/groupby",
  authCheckMiddleware,
  validate(dtwMasterValidation.getAllFilter),
  dtwMasterController.allFilterGroupPaginationErp
);
/**
 * delete document
 */
router.delete(
  "/dealer/:dtwnumber",
  authCheckDealerMiddleware,
  validate(dtwMasterValidation.deleteDocument),
  dtwMasterController.deleteDocument
);
/**
 * update rtv status
 */
router.put(
  "/dealer/approval-level/:dtwNumber",
  authCheckDealerMiddleware,
  validate(dtwMasterValidation.updateApproval),
  dtwMasterController.updateLevel
);

router.put(
  "/approval-level/:dtwNumber",
  authCheckMiddleware,
  validate(dtwMasterValidation.updateApproval),
  dtwMasterController.updateLevel
);

/**
 * update dtw status
 */
router.get(
  "/dealer/update-dtw-status/:dtwnumber/status/:status",
  authCheckDealerMiddleware,
  validate(dtwMasterValidation.updatedtwStatus),
  dtwMasterController.updatedtwStatus
);
module.exports = router;
