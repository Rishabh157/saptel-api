const router = require('express').Router()
const validate = require('../../middleware/validate')
const fileManagerValidation = require('../../validation/FileManagerValidation')
const fileManagerController = require('../../controller/fileManager/FileManagerController')
const multerFile = require('../../middleware/multerFileUpload')
const { authCheckMiddleware } = require('../../middleware/authenticationCheck')
const { accessModuleCheck } = require('../../middleware/accessModuleCheck')

//-----------------------------------------------------

/**
 * get one document (if query) / all documents
 */
router.get(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(fileManagerValidation.get),
  fileManagerController.get
)

/**
 * get all user pagination filter
 */

router.post(
  '/',
  accessModuleCheck,
  authCheckMiddleware,
  validate(fileManagerValidation.getAllFilter),
  fileManagerController.allFilterPagination
)

/**
 * create new document
 */
router.post(
  '/add',
  accessModuleCheck,
  authCheckMiddleware,
  multerFile.fileUpload.array('fileUrl', 1),
  fileManagerValidation.fileExistCheck,
  validate(fileManagerValidation.create),
  fileManagerController.add
)

/**
 * update document
 */
router.put(
  '/:id',
  accessModuleCheck,
  authCheckMiddleware,
  multerFile.fileUpload.array('fileUrl', 1),
  fileManagerValidation.fileExistCheck,
  validate(fileManagerValidation.update),
  fileManagerController.update
)

/**
 * update status
 */
router.put(
  '/status-change/:id',
  accessModuleCheck,
  authCheckMiddleware,
  validate(fileManagerValidation.changeStatus),
  fileManagerController.statusChange
)

/**
 * delete document
 */
router.delete(
  '/:id',
  authCheckMiddleware,
  accessModuleCheck,
  validate(fileManagerValidation.deleteDocument),
  fileManagerController.deleteDocument
)

module.exports = router
