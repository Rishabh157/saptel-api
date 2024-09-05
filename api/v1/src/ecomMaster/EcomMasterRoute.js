const router = require("express").Router();
const ecomMasterController = require("./EcomMasterController");
const validate = require("../../middleware/validate");
const ecomMasterValidation = require("./EcomMasterValidation");

const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(ecomMasterValidation.get),
  ecomMasterController.get
);
/**
 * get all ecomMaster pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(ecomMasterValidation.getAllFilter),
  ecomMasterController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(ecomMasterValidation.create),
  ecomMasterController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(ecomMasterValidation.update),
  ecomMasterController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(ecomMasterValidation.getById),
  ecomMasterController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",

  authCheckMiddleware,
  validate(ecomMasterValidation.changeStatus),
  ecomMasterController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(ecomMasterValidation.deleteDocument),
  ecomMasterController.deleteDocument
);

module.exports = router;
