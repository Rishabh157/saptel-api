const allFileEnum = Object.freeze({
  image: 'IMAGE',
  document: 'DOCUMENT',
  video: 'VIDEO'
})

const tokenEnum = Object.freeze({ login: 'LOGIN', otpverify: 'OTP_VERIFY' })

const postEnum = Object.freeze({ ad: 'AD', normal: 'NORMAL' })
const userEnum = Object.freeze({
  user: 'USER',
  admin: 'ADMIN',
  superAdmin: 'SUPER_ADMIN'
})

module.exports = {
  allFileEnum,
  tokenEnum,
  postEnum,
  userEnum
}
