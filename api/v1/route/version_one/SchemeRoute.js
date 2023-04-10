const router = require('express').Router()
const schemeController = require('../../controller/scheme/SchemeController')
const validate = require('../../middleware/validate')
const schemeValidation = require('../../validation/SchemeValidation')
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
  validate(schemeValidation.get),
  schemeController.get
)
/**
 * get all scheme pagination filter
 */

router.post(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(schemeValidation.getAllFilter),
  schemeController.allFilterPagination
)

/**
 * create new document
 */
router.post(
  '/add',
  accessModuleCheck,
  authCheckMiddleware,
  validate(schemeValidation.create),
  schemeController.add
)
/**
 * update document
 */
router.put(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(schemeValidation.update),
  schemeController.update
)
/**
 * update status
 */
router.put(
  '/status-change/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(schemeValidation.changeStatus),
  schemeController.statusChange
)
/**
 * delete document
 */
router.delete(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(schemeValidation.deleteDocument),
  schemeController.deleteDocument
)

module.exports = router
