const router = require('express').Router()
const asrRequestController = require('../../controller/asrRequest/AsrRequestController')
const validate = require('../../middleware/validate')
const asrRequestValidation = require('../../validation/AsrRequestValidation')
const { accessModuleCheck } = require('../../middleware/accessModuleCheck')
const { authCheckMiddleware } = require('../../middleware/authenticationCheck')

//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(asrRequestValidation.get),
  asrRequestController.get
)
/**
 * get all asrRequest pagination filter
 */

router.post(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(asrRequestValidation.getAllFilter),
  asrRequestController.allFilterPagination
)

/**
 * create new document
 */
router.post(
  '/add',
  accessModuleCheck,
  authCheckMiddleware,
  validate(asrRequestValidation.create),
  asrRequestController.add
)
/**
 * update document
 */
router.put(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(asrRequestValidation.update),
  asrRequestController.update
)
/**
 * update status
 */
router.put(
  '/status-change/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(asrRequestValidation.changeStatus),
  asrRequestController.statusChange
)
/**
 * delete document
 */
router.delete(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(asrRequestValidation.deleteDocument),
  asrRequestController.deleteDocument
)

module.exports = router
