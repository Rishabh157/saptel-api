const router = require('express').Router()
const accessmoduleController = require('../../controller/accessModule/AccessModuleController')
const validate = require('../../middleware/validate')
const accessmoduleValidation = require('../../validation/AccessModuleValidation')
const {
  authCheckMiddleware,
  otpVerifyToken
} = require('../../middleware/authenticationCheck')
const { accessModuleCheck } = require('../../middleware/accessModuleCheck')
//-----------------------------------------------------
/**
 * get one document (if query) / all documents
 */
router.get(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(accessmoduleValidation.get),
  accessmoduleController.get
)

/**
 * get all accessmodule pagination filter
 */

router.post(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(accessmoduleValidation.getAllFilter),
  accessmoduleController.allFilterPagination
)

/**
 * create new document
 */
router.post(
  '/add',
  authCheckMiddleware,
  validate(accessmoduleValidation.create),
  accessmoduleController.add
)
/**
 * update document
 */
router.put(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(accessmoduleValidation.update),
  accessmoduleController.update
)
/**
 * update status
 */
router.put(
  '/status-change/:id',
  authCheckMiddleware,
  accessModuleCheck,
  validate(accessmoduleValidation.changeStatus),
  accessmoduleController.statusChange
)
/**
 * delete document
 */
router.delete(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(accessmoduleValidation.deleteDocument),
  accessmoduleController.deleteDocument
)

module.exports = router
