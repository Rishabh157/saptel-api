const router = require('express').Router()
const cartonBoxController = require('../../controller/cartonBox/CartonBoxController')
const validate = require('../../middleware/validate')
const cartonBoxValidation = require('../../validation/CartonBoxValidation')
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
  validate(cartonBoxValidation.get),
  cartonBoxController.get
)
/**
 * get all cartonBox pagination filter
 */

router.post(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxValidation.getAllFilter),
  cartonBoxController.allFilterPagination
)

/**
 * create new document
 */
router.post(
  '/add',
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxValidation.create),
  cartonBoxController.add
)
/**
 * update document
 */
router.put(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxValidation.update),
  cartonBoxController.update
)
/**
 * update status
 */
router.put(
  '/status-change/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxValidation.changeStatus),
  cartonBoxController.statusChange
)
/**
 * delete document
 */
router.delete(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(cartonBoxValidation.deleteDocument),
  cartonBoxController.deleteDocument
)

module.exports = router
