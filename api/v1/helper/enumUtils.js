const allFileEnum = Object.freeze({
  image: 'IMAGE',
  document: 'DOCUMENT',
  video: 'VIDEO'
})

const tokenEnum = Object.freeze({ login: 'LOGIN', otpverify: 'OTP_VERIFY' })

const accountEnum = Object.freeze({ saving: 'SAVING', current: 'CURRENT' })
const userEnum = Object.freeze({
  user: 'USER',
  admin: 'ADMIN',
  superAdmin: 'SUPER_ADMIN'
})
const actionEnum = Object.freeze({
  create: 'ADD',
  update: 'UPDATE',
  delete: 'DELETE',
  changeStatus: 'CHANGE_STATUS',
  getAll: 'ALL_NORMAL_LIST',
  getOne: 'VIEW',
  allPaginationFilter: 'ALL_PAGINATION_FILTER_LIST'
})

module.exports = {
  allFileEnum,
  tokenEnum,
  accountEnum,
  userEnum,
  actionEnum
}
