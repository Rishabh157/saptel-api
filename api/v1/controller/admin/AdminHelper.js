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
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message, status, data, code, issue } = errData.resData
    return { message, status, data, code, issue, statusCode: code }
  }
}
