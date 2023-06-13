const router = require("express").Router();
const validate = require("../../middleware/validate");
const inquiryValidation = require("./InquiryValidation");
const inquiryController = require("./InquiryController");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  //   validate(inquiryValidation.get),
  inquiryController.get
);

//===============get document by id===============
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  //   validate(inquiryValidation),
  inquiryController.getById
);

//===============get all pagination filter===============
router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  inquiryController.allFilterPagination
);

//===============create new document===============
// router.post(
//   "/add",
//   accessModuleCheck,
//   authCheckMiddleware,
//   validate(inquiryValidation.create),
//   inquiryController.add
// );

//===============update document===============
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  // validate(inquiryValidation.update),
  inquiryController.update
);

//===============update status document===============
// router.put(
//   "/status-change/:id",
//   validate(initialCallOneValidation.changeStatus),
//   initialCallOneController.statusChange
// );

//===============delete document===============
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(inquiryValidation.deleteDocument),
  inquiryController.deleteDocument
);

module.exports = router;
