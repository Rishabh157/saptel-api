const router = require('express').Router()
const {
  authCheckMiddleware,
  otpVerifyToken
} = require('../../middleware/authenticationCheck')
const multerFile = require('../../middleware/MulterFileUpload')
const validate = require('../../middleware/validate')
const fileManagerValidation = require('../../validation/FileManagerValidation')
const fileManagerController = require('../../controller/fileManager/FileManagerController')

//---------------------------------------------------
router.get('/', authCheckMiddleware, fileManagerController.list)

//---------------------------------------------------
router.post(
  '/add',
  authCheckMiddleware,
  multerFile.fileUpload.array('fileUrl', 1),
  fileManagerValidation.fileExistCheck,
  validate(fileManagerValidation.create),
  fileManagerController.add
)

//---------------------------------------------------

router.post(
  '/',
  authCheckMiddleware,
  validate(fileManagerValidation.getAllFilter),
  fileManagerController.allWithFilters
)

//---------------------------------------------------

router.put(
  '/:id',
  authCheckMiddleware,
  multerFile.fileUpload.array('fileUrl', 1),
  fileManagerValidation.fileExistCheck,
  validate(fileManagerValidation.update),
  fileManagerController.update
)
//---------------------------------------------------

router.put(
  '/change-status/:id',
  authCheckMiddleware,
  validate(fileManagerValidation.changeStatus),
  fileManagerController.changeActiveStatus
)

//---------------------------------------------------

router.get(
  '/:id',
  authCheckMiddleware,
  validate(fileManagerValidation.get),
  fileManagerController.view
)
//---------------------------------------------------

router.delete(
  '/:id',
  authCheckMiddleware,
  validate(fileManagerValidation.delete),
  fileManagerController.delete_by_id
)
//---------------------------------------------------

module.exports = router
