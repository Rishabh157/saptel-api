const router = require('express').Router()
const districtController = require('../../controller/district/DistrictController')
const validate = require('../../middleware/validate')
const districtValidation = require('../../validation/DistrictValidation')
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
  validate(districtValidation.get),
  districtController.get
)
/**
 * get all district pagination filter
 */

router.post(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.getAllFilter),
  districtController.allFilterPagination
)

/**
 * create new document
 */
router.post(
  '/add',
  accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.create),
  districtController.add
)
/**
 * update document
 */
router.put(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.update),
  districtController.update
)
/**
 * update status
 */
router.put(
  '/status-change/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.changeStatus),
  districtController.statusChange
)
/**
 * delete document
 */
router.delete(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(districtValidation.deleteDocument),
  districtController.deleteDocument
)

module.exports = router
