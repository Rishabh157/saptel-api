const router = require("express").Router();
const dealerUserController = require("./DealerUserController");
const validate = require("../../middleware/validate");
const dealerUserValidation = require("./DealerUserValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const {
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(dealerUserValidation.get),
  dealerUserController.get
);
/**
 * get all dealerUser pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(dealerUserValidation.getAllFilter),
  dealerUserController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(dealerUserValidation.create),
  dealerUserController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(dealerUserValidation.update),
  dealerUserController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(dealerUserValidation.getById),
  dealerUserController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(dealerUserValidation.changeStatus),
  dealerUserController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(dealerUserValidation.deleteDocument),
  dealerUserController.deleteDocument
);

module.exports = router;
