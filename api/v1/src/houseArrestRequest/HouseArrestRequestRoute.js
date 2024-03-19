const router = require("express").Router();
const houseArrestRequestController = require("./HouseArrestRequestController");
const validate = require("../../middleware/validate");
const houseArrestRequestValidation = require("./HouseArrestRequestValidation");

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
  validate(houseArrestRequestValidation.get),
  houseArrestRequestController.get
);
/**
 * get all houseArrestRequest pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(houseArrestRequestValidation.getAllFilter),
  houseArrestRequestController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(houseArrestRequestValidation.create),
  houseArrestRequestController.add
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(houseArrestRequestValidation.getById),
  houseArrestRequestController.getById
);

module.exports = router;
