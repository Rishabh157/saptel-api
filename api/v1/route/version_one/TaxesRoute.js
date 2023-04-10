const router = require('express').Router()
const taxesController = require('../../controller/taxes/TaxesController')
const validate = require('../../middleware/validate')
const taxesValidation = require('../../validation/TaxesValidation')
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
  validate(taxesValidation.get),
  taxesController.get
)
/**
 * get all taxes pagination filter
 */

router.post(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(taxesValidation.getAllFilter),
  taxesController.allFilterPagination
)

/**
 * create new document
 */
router.post(
  '/add',
  accessModuleCheck,
  authCheckMiddleware,
  validate(taxesValidation.create),
  taxesController.add
)
/**
 * update document
 */
router.put(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(taxesValidation.update),
  taxesController.update
)
/**
 * update status
 */
router.put(
  '/status-change/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(taxesValidation.changeStatus),
  taxesController.statusChange
)
/**
 * delete document
 */
router.delete(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(taxesValidation.deleteDocument),
  taxesController.deleteDocument
)

module.exports = router
