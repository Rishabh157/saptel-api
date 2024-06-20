const router = require("express").Router();
const reprintOuterBoxController = require("./ReprintOuterBoxController");
const validate = require("../../middleware/validate");
const reprintOuterBoxValidation = require("./ReprintOuterBoxValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(reprintOuterBoxValidation.get),
  reprintOuterBoxController.get
);
/**
 * get all reprintOuterBox pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(reprintOuterBoxValidation.getAllFilter),
  reprintOuterBoxController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(reprintOuterBoxValidation.create),
  reprintOuterBoxController.add
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(reprintOuterBoxValidation.getById),
  reprintOuterBoxController.getById
);

module.exports = router;
