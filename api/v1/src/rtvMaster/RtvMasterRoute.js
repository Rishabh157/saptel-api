const router = require("express").Router();
const rtvMasterController = require("./RtvMasterController");
const validate = require("../../middleware/validate");
const rtvMasterValidation = require("./RtvMasterValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");
//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(rtvMasterValidation.get),
  rtvMasterController.get
);
/**
 * get all rtvMaster pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(rtvMasterValidation.getAllFilter),
  rtvMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(rtvMasterValidation.create),
  rtvMasterController.add
);
/**
 * update document
 */
router.put(
  "/update-rtv",
  authCheckMiddleware,
  validate(rtvMasterValidation.update),
  rtvMasterController.update
);
router.post(
  "/groupby",
  authCheckMiddleware,
  validate(rtvMasterValidation.getAllFilter),
  rtvMasterController.allFilterGroupPagination
);

/**
 * get by id
 */
router.get(
  "/:rtvnumber",
  authCheckMiddleware,
  validate(rtvMasterValidation.getById),
  rtvMasterController.getByRtvNumber
);

/**
 * get by id
 */
router.get(
  "/update-rtv-status/:rtvnumber/status/:status",
  authCheckMiddleware,
  validate(rtvMasterValidation.updateRtvStatus),
  rtvMasterController.updateRtvStatus
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(rtvMasterValidation.changeStatus),
  rtvMasterController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:rtvnumber",
  authCheckMiddleware,
  validate(rtvMasterValidation.deleteDocument),
  rtvMasterController.deleteDocument
);
/**
 * update rtv status
 */
router.put(
  "/approval-level/:rtvNumber",
  authCheckMiddleware,
  validate(rtvMasterValidation.updateApproval),
  rtvMasterController.updateLevel
);

module.exports = router;
