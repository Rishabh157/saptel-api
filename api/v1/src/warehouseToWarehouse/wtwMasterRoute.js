const router = require("express").Router();
const wtwMasterController = require("./wtwMasterController");
const validate = require("../../middleware/validate");
const wtwMasterValidation = require("./wtwMasterValidation");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(wtwMasterValidation.get),
  wtwMasterController.get
);
/**
 * get all wtwMaster pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(wtwMasterValidation.getAllFilter),
  wtwMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(wtwMasterValidation.create),
  wtwMasterController.add
);
/**
 * update document
 */
router.put(
  "/update-wtw",
  authCheckMiddleware,
  validate(wtwMasterValidation.update),
  wtwMasterController.update
);

/**
 * get by id
 */
router.get(
  "/:wtnumber",
  authCheckMiddleware,
  validate(wtwMasterValidation.getById),
  wtwMasterController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(wtwMasterValidation.changeStatus),
  wtwMasterController.statusChange
);
// grooup by
router.post(
  "/groupby",
  authCheckMiddleware,
  validate(wtwMasterValidation.getAllFilter),
  wtwMasterController.allFilterGroupPagination
);
/**
 * delete document
 */
router.delete(
  "/:wtnumber",
  authCheckMiddleware,
  validate(wtwMasterValidation.deleteDocument),
  wtwMasterController.deleteDocument
);
/**
 * update rtv status
 */
router.put(
  "/approval-level/:wtNumber",
  authCheckMiddleware,
  validate(wtwMasterValidation.updateApproval),
  wtwMasterController.updateLevel
);

/**
 * update wtw status
 */
router.get(
  "/update-wtw-status/:wtwnumber/status/:status",
  authCheckMiddleware,
  validate(wtwMasterValidation.updateWtwStatus),
  wtwMasterController.updatewtwStatus
);
module.exports = router;
