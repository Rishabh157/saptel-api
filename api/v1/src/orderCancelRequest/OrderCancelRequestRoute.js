const router = require("express").Router();
const orderCancelRequestController = require("./OrderCancelRequestController");
const validate = require("../../middleware/validate");
const orderCancelRequestValidation = require("./OrderCancelRequestValidation");

const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",

  authCheckMiddleware,
  validate(orderCancelRequestValidation.get),
  orderCancelRequestController.get
);

// Cancel order
router.put(
  "/cancel-order/:ordernumber/cancel-request/:cancelRequestId",
  authCheckMiddleware,
  //   validate(orderValidation),
  orderCancelRequestController.cancelOrder
);

/**
 * get all orderCancelRequest pagination filter
 */

router.post(
  "/",

  authCheckMiddleware,
  validate(orderCancelRequestValidation.getAllFilter),
  orderCancelRequestController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",

  authCheckMiddleware,
  validate(orderCancelRequestValidation.create),
  orderCancelRequestController.add
);
/**
 * update document
 */
router.put(
  "/:id",

  authCheckMiddleware,
  validate(orderCancelRequestValidation.update),
  orderCancelRequestController.update
);

/**
 * get by id
 */
router.get(
  "/:id",

  authCheckMiddleware,
  validate(orderCancelRequestValidation.getById),
  orderCancelRequestController.getById
);

/**
 * delete document
 */
router.delete(
  "/:id",

  authCheckMiddleware,
  validate(orderCancelRequestValidation.deleteDocument),
  orderCancelRequestController.deleteDocument
);

module.exports = router;
