const router = require('express').Router()
const adminController = require('../../controller/admin/AdminController')
const validate = require('../../middleware/validate')
const adminValidation = require('../../validation/AdminValidation')
const {
  authCheckMiddleware,
  otpVerifyToken
} = require('../../middleware/authenticationCheck')

/**
 * get one document (if query) / all documents
 */
router.get(
  '/',
  authCheckMiddleware,
  validate(adminValidation.get),
  adminController.get
)

/**
 * get all user pagination filter
 */

router.post(
  '/',
  authCheckMiddleware,
  validate(adminValidation.getAllFilter),
  adminController.allFilterPagination
)

/**
 * create new admin user
 */
router.post(
  '/add',
  // authCheckMiddleware,
  validate(adminValidation.createValid),
  adminController.add
)

/**
 * login admin via otp
 */
router.post(
  '/login',
  validate(adminValidation.loginValid),
  adminController.login
)

/**
 * verify otp send on mobile
 */
router.post(
  '/verify-otp',
  otpVerifyToken,
  validate(adminValidation.verifyOtpValid),
  adminController.verifyOtp
)

/**
 * update status
 */
router.put(
  '/status-change/:id',
  authCheckMiddleware,
  validate(adminValidation.changeStatus),
  adminController.statusChange
)

/**
 * delete document
 */
router.delete(
  '/:id',
  authCheckMiddleware,
  validate(adminValidation.deleteDocument),
  adminController.deleteDocument
)

module.exports = router
