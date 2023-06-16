const router = require("express").Router();
const wareHouseController = require("./WareHouseController");
const validate = require("../../middleware/validate");
const wareHouseValidation = require("./WareHouseValidation");
const { accessModuleCheck } = require("../../middleware/accessModuleCheck");
const {
  authCheckMiddleware,
  authCheckDealerMiddleware,
} = require("../../middleware/authenticationCheck");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  "/company/:companyid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.get),
  wareHouseController.get
);

/**
 * get all warehouse of a dealer
 */
router.get(
  "/company/:companyid/dealer/:dealerid",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.getAllByDealerId),
  wareHouseController.getAllByDealerId
);
/**
 * get one document
 */
router.get(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.getDocument),
  wareHouseController.getById
);
/**
 * get one document for dealer app
 */
router.get(
  "/dealer/:id",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(wareHouseValidation.getDocument),
  wareHouseController.getById
);
/**
 * get all wareHouse pagination filter
 */

router.post(
  "/",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.getAllFilter),
  wareHouseController.allFilterPagination
);
// dealer project warehouse
router.post(
  "/dealer",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(wareHouseValidation.getAllFilter),
  wareHouseController.allFilterPagination
);

/**
 * create new document
 */
router.post(
  "/add",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.create),
  wareHouseController.add
);
/**
 * create new document in dealer app
 */
router.post(
  "/dealer/add",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(wareHouseValidation.create),
  wareHouseController.add
);
/**
 * update document
 */
router.put(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.update),
  wareHouseController.update
);
/**
 * update document for dealer app
 */
router.put(
  "/dealer/:id",
  accessModuleCheck,
  authCheckDealerMiddleware,
  validate(wareHouseValidation.update),
  wareHouseController.update
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.changeStatus),
  wareHouseController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  accessModuleCheck,
  authCheckMiddleware,
  validate(wareHouseValidation.deleteDocument),
  wareHouseController.deleteDocument
);

module.exports = router;
