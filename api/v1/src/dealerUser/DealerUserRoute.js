const router = require("express").Router();
const dealerUserController = require("./DealerUserController");
const validate = require("../../middleware/validate");
const dealerUserValidation = require("./DealerUserValidation");
const {
  authCheckDealerMiddleware,
  authCheckMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  authCheckDealerMiddleware,
  validate(dealerUserValidation.get),
  dealerUserController.get
);

/**
 * get all dealerUser pagination filter
 */

router.post(
  "/",
  authCheckDealerMiddleware,
  validate(dealerUserValidation.getAllFilter),
  dealerUserController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckDealerMiddleware,
  validate(dealerUserValidation.create),
  dealerUserController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  authCheckDealerMiddleware,
  validate(dealerUserValidation.update),
  dealerUserController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  authCheckDealerMiddleware,
  validate(dealerUserValidation.getById),
  dealerUserController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckDealerMiddleware,
  validate(dealerUserValidation.changeStatus),
  dealerUserController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckDealerMiddleware,
  validate(dealerUserValidation.deleteDocument),
  dealerUserController.deleteDocument
);

module.exports = router;
