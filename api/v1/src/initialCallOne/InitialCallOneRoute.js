const router = require("express").Router();
const validate = require("../../middleware/validate");
const initialCallOneValidation = require("./InitialCallOneValidation");
const initialCallOneController = require("./InitialCallOneController");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  authCheckMiddleware,
  validate(initialCallOneValidation.get),
  initialCallOneController.get
);

//===============get document by id===============
router.get(
  "/:id",
  authCheckMiddleware,
  validate(initialCallOneValidation.getById),
  initialCallOneController.getById
);

//===============get all dispositionOne pagination filter===============
router.post(
  "/",
  authCheckMiddleware,
  validate(initialCallOneValidation.getAllFilter),
  initialCallOneController.allFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  authCheckMiddleware,
  validate(initialCallOneValidation.create),
  initialCallOneController.add
);

//===============update document===============
router.put(
  "/:id",
  authCheckMiddleware,
  validate(initialCallOneValidation.update),
  initialCallOneController.update
);

//===============update status document===============
router.put(
  "/status-change/:id",
  validate(initialCallOneValidation.changeStatus),
  initialCallOneController.statusChange
);

//===============delete document===============
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(initialCallOneValidation.deleteDocument),
  initialCallOneController.deleteDocument
);

module.exports = router;
