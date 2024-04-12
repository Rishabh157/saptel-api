const router = require("express").Router();
const dispositionThreeController = require("./DispositionThreeController");
const dispositionThreeValidation = require("./DispositionThreeValidation");
const validate = require("../../middleware/validate");
const {
  authCheckMiddleware,
  authCheckDealerMiddleware,
  authCheckDeliveryBoyMiddleware,
} = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  authCheckMiddleware,
  validate(dispositionThreeValidation.get),
  dispositionThreeController.get
);
//===============get one document (if query) / all document for dealer panel===============
router.get(
  "/dealer/get-all-disposition-three",
  authCheckDealerMiddleware,
  validate(dispositionThreeValidation.get),
  dispositionThreeController.getAllForDealer
);

//===============get one document (if query) / all document  (without token)===============
router.get(
  "/unauth/",
  // authCheckMiddleware,
  validate(dispositionThreeValidation.get),
  dispositionThreeController.get
);

//===============get document by id===============
router.get(
  "/:id",
  authCheckMiddleware,
  validate(dispositionThreeValidation.getById),
  dispositionThreeController.getById
);
//===============get all document fo dispositionTwoId (without token)===============
router.get(
  "/unauth/get-all/:id",
  // authCheckMiddleware,
  validate(dispositionThreeValidation.getByDispositionOneId),
  dispositionThreeController.getByDispositionTwoId
);
//===============get all document fo dispositionTwoId (without token for delivery boy)===============
router.get(
  "/delivery-boy/dispositionthree/:id",
  authCheckDeliveryBoyMiddleware,
  validate(dispositionThreeValidation.getByDispositionOneId),
  dispositionThreeController.getByDispositionTwoId
);

//===============get all document fo dispositionTwoId ( for dealer app)===============
router.get(
  "/dealer-app/dispositionthree/:id",
  authCheckDealerMiddleware,
  validate(dispositionThreeValidation.getByDispositionOneId),
  dispositionThreeController.getByDispositionTwoId
);

//===============get all document fo dispositionTwo Id===============
router.get(
  "/get-all/:id",
  authCheckMiddleware,
  validate(dispositionThreeValidation.getByDispositionOneId),
  dispositionThreeController.getByDispositionTwoId
);

//===============get all pagination filter===============
router.post(
  "/",
  authCheckMiddleware,
  validate(dispositionThreeValidation.getAllFilter),
  dispositionThreeController.getFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  authCheckMiddleware,
  validate(dispositionThreeValidation.create),
  dispositionThreeController.add
);

//===============update document===============
router.put(
  "/:id",
  authCheckMiddleware,
  validate(dispositionThreeValidation.update),
  dispositionThreeController.update
);

//===============update status document===============
router.put(
  "/status-change/:id",
  validate(dispositionThreeValidation.changeStatus),
  dispositionThreeController.statusChange
);

//===============delete document===============
// router.delete(
//   "/:id",
//   authCheckMiddleware,
//   validate(dispositionThreeValidation.deleteDocument),
//   dispositionThreeController.deleteDocument
// );

module.exports = router;
