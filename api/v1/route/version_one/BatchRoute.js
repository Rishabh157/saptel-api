const router = require("express").Router();
const batchController = require("../../controller/batch/BatchController");
const batchValidation = require("../../validation/BatchValidation");
const validate = require("../../middleware/validate");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
// router.get(
//   "/",
//   accessModuleCheck,
//   authCheckMiddleware,
//   validate(batchValidation.get),
//   batchController.get
// );

//===============get document by id===============
// router.get(
//   "/:id",
//   accessModuleCheck,
//   authCheckMiddleware,
//   validate(batchValidation.getById),
//   batchController.getById
// );

//===============get all pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  // validate(batchValidation.getAllFilter),
  batchController.getFilterPagination
);

//===============create new document===============
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  //   validate(batchValidation.create),
  batchController.add
);

//===============update document===============
// router.put(
//   "/:id",
//   accessModuleCheck,
//   authCheckMiddleware,
//   validate(batchValidation.update),
//   batchController.update
// );

//===============update status document===============
// router.put(
//   "/status-change/:id",
//   validate(batchValidation.changeStatus),
//   batchController.statusChange
// );

//===============delete document===============
// router.delete(
//   "/:id",
//   accessModuleCheck,
//   authCheckMiddleware,
//   validate(batchValidation.deleteDocument),
//   batchController.deleteDocument
// );

module.exports = router;
