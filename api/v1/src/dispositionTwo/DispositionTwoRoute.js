const router = require("express").Router();
const dispositionTwoController = require("./DispositionTwoController");
const dispositionTwoValidation = require("./DispositionTwoValidation");
const validate = require("../../middleware/validate");
const {
  authCheckMiddleware,
  authCheckDeliveryBoyMiddleware,
} = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  authCheckMiddleware,
  validate(dispositionTwoValidation.get),
  dispositionTwoController.get
);

// get disposition for divelry boy API
router.get(
  "/delivery-boy/dispositiontwo",
  authCheckDeliveryBoyMiddleware,
  validate(dispositionTwoValidation.get),
  dispositionTwoController.getAuth
);
//===============get one document (if query) / all document  (without token)===============
router.get(
  "/unauth-dp2",
  // authCheckMiddleware,
  validate(dispositionTwoValidation.get),
  dispositionTwoController.getAuth
);

//===============get all document fo dispositionTwo Id Wihtout token===============
router.get(
  "/unauth/get-all/:id",
  // authCheckMiddleware,
  validate(dispositionTwoValidation.getByDispositionOneId),
  dispositionTwoController.getByDispositionOneId
);

//===============get document by id===============
router.get(
  "/:id",
  authCheckMiddleware,
  validate(dispositionTwoValidation.getById),
  dispositionTwoController.getById
);

//===============get all document fo dispositionOne Id===============
router.get(
  "/get-all/:id",
  authCheckMiddleware,
  validate(dispositionTwoValidation.getByDispositionOneId),
  dispositionTwoController.getByDispositionOneId
);

//===============get all dispositionOne pagination filter===============

router.post(
  "/",
  authCheckMiddleware,
  validate(dispositionTwoValidation.getAllFilter),
  dispositionTwoController.getFilterPagination
);
//===============create new document===============
router.post(
  "/add",
  authCheckMiddleware,
  validate(dispositionTwoValidation.create),
  dispositionTwoController.add
);

//===============update document===============
router.put(
  "/:id",
  authCheckMiddleware,
  validate(dispositionTwoValidation.update),
  dispositionTwoController.update
);

//===============update status document===============
router.put(
  "/status-change/:id",
  validate(dispositionTwoValidation.changeStatus),
  dispositionTwoController.statusChange
);

//===============delete document===============
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(dispositionTwoValidation.deleteDocument),
  dispositionTwoController.deleteDocument
);

module.exports = router;
