const router = require("express").Router();
const inboundController = require("../../controller/inbound/InboundController");
const validate = require("../../middleware/validate");
const inboundValidation = require("../../validation/InboundValidation");

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get("/", validate(inboundValidation.get), inboundController.get);
/**
 * get all inbound pagination filter
 */

router.post(
  "/",
  validate(inboundValidation.getAllFilter),
  inboundController.allFilterPagination
);

/**
 * create new document
 */
router.post("/add", validate(inboundValidation.create), inboundController.add);
/**
 * update document
 */
router.put(
  "/:id",
  validate(inboundValidation.update),
  inboundController.update
);

/**
 * get by id
 */
router.get(
  "/:id",
  validate(inboundValidation.getById),
  inboundController.getById
);
/**
 * update status
 */
router.put(
  "/status-change/:id",
  validate(inboundValidation.changeStatus),
  inboundController.statusChange
);
/**
 * delete document
 */
router.delete(
  "/:id",
  validate(inboundValidation.deleteDocument),
  inboundController.deleteDocument
);

module.exports = router;
