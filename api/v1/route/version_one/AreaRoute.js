const router = require('express').Router()
const areaController = require('../../controller/area/AreaController')
const validate = require('../../middleware/validate')
const areaValidation = require('../../validation/AreaValidation')
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
  validate(areaValidation.get),
  areaController.get
)
/**
 * get all area pagination filter
 */

router.post(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(areaValidation.getAllFilter),
  areaController.allFilterPagination
)

/**
 * create new document
 */
router.post(
  '/add',
  accessModuleCheck,
  authCheckMiddleware,
  validate(areaValidation.create),
  areaController.add
)
/**
 * update document
 */
router.put(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(areaValidation.update),
  areaController.update
)
/**
 * update status
 */
router.put(
  '/status-change/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(areaValidation.changeStatus),
  areaController.statusChange
)
/**
 * delete document
 */
router.delete(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(areaValidation.deleteDocument),
  areaController.deleteDocument
)

module.exports = router
