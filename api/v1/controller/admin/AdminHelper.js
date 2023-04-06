const errorRes = require('../../../utils/resError')
const adminService = require('../../services/AdminService')

const uniqueFields = {
  mobile: 'mobile',
  userName: 'user name',
  email: 'email'
}

/*
  filter object 
  [{mobile:""}, {},  {}]
*/

exports.checkUniqueFieldsAdd = async (req, res, fields) => {
  try {
    let message = ''
    let status = true

    if (Object.keys(uniqueFields).length) {
      for (const each in uniqueFields) {
        let objeToCheck = {
          [each]: req.body[each],
          isDeleted: false
        }

        if (req.body[each]) {
          if (await adminService.getOneByMultiField(objeToCheck)) {
            message += `${uniqueFields[each]} ${req.body[each]} already exist. `
            status = false
          }
        }
      }
    }
    return { message, status }
  } catch (err) {
    let msg = []
    let i = 1
    let error_msg = 'Something went wrong.'
    let statusCode =
      err.statusCode !== undefined && err.statusCode !== null
        ? err.statusCode
        : 500
    if (!err.message) {
      for (let key in err.errors) {
        if (err.errors[key].message) {
          error_msg += i + '.' + err.errors[key].message
          i++
        }
      }
    } else {
      error_msg = err.message
    }
    return { message: error_msg, status: false, statusCode: statusCode }
  }
}
