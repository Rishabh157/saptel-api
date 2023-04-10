const router = require('express').Router()
const attributesController = require('../../controller/attributes/AttributesController')
const validate = require('../../middleware/validate')
const attributesValidation = require('../../validation/AttributesValidation')
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
  validate(attributesValidation.get),
  attributesController.get
)
/**
 * get all attributes pagination filter
 */

router.post(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(attributesValidation.getAllFilter),
  attributesController.allFilterPagination
)

/**
 * create new document
 */
router.post(
  '/add',
  accessModuleCheck,
  authCheckMiddleware,
  validate(attributesValidation.create),
  attributesController.add
)
/**
 * update document
 */
router.put(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(attributesValidation.update),
  attributesController.update
)
/**
 * update status
 */
router.put(
  '/status-change/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(attributesValidation.changeStatus),
  attributesController.statusChange
)
/**
 * delete document
 */
router.delete(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(attributesValidation.deleteDocument),
  attributesController.deleteDocument
)

module.exports = router
