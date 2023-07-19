const router = require("express").Router();
const validate = require("../../middleware/validate");
const inquiryValidation = require("./InquiryValidation");
const inquiryController = require("./InquiryController");
const {
  authCheckMiddleware,
  otpVerifyToken,
} = require("../../middleware/authenticationCheck");

//===============get one document (if query) / all document===============
router.get(
  "/",
  authCheckMiddleware,
  //   validate(inquiryValidation.get),
  inquiryController.get
);

//===============get document by id===============
router.get(
  "/:id",
  authCheckMiddleware,
  //   validate(inquiryValidation),
  inquiryController.getById
);

//===============get all pagination filter===============
router.post("/", authCheckMiddleware, inquiryController.allFilterPagination);

//===============create new document===============
// router.post(
//   "/add",
//   authCheckMiddleware,
//   validate(inquiryValidation.create),
//   inquiryController.add
// );

//===============update document===============
router.put(
  "/:id",
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
  authCheckMiddleware,
  validate(inquiryValidation.deleteDocument),
  inquiryController.deleteDocument
);

module.exports = router;
