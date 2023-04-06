const router = require('express').Router()
const userController = require('../../controller/user/UserController')
const validate = require('../../middleware/validate')
const userValidation = require('../../validation/UserValidation')
const {
  authCheckMiddleware,
  otpVerifyToken
} = require('../../middleware/authenticationCheck')
//-----------------------------------------------------

/**
 * get one document (if query) / all documents
 */
router.get(
  '/',
  authCheckMiddleware,
  validate(userValidation.get),
  userController.get
)

/**
 * get all user pagination filter
 */

router.post(
  '/',
  authCheckMiddleware,
  validate(userValidation.getAllFilter),
  userController.allFilterPagination
)

/**
 * create new document
 */
router.post('/signup', validate(userValidation.create), userController.add)

/**
 * login user via otp
 */
router.post('/login', validate(userValidation.loginValid), userController.login)

/**
 * verify otp send on mobile
 */
router.post(
  '/verify-otp',
  otpVerifyToken,
  validate(userValidation.verifyOtpValid),
  userController.verifyOtp
)
/**
 * update document
 */
router.put(
  '/update-profile',
  authCheckMiddleware,
  validate(userValidation.update),
  userController.update
)

/**
 * update status
 */
router.put(
  '/status-change/:id',
  authCheckMiddleware,
  validate(userValidation.changeStatus),
  userController.statusChange
)

/**
 * delete document
 */
router.delete(
  '/:id',
  authCheckMiddleware,
  validate(userValidation.deleteDocument),
  userController.deleteDocument
)

module.exports = router
