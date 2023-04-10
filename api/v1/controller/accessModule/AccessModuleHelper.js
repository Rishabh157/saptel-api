const mongoose = require('mongoose')
const { actionMethodEnum } = require('../../helper/enumUtils')

const isAllFieldsExists = (allFields, fields) => {
  const filteredArray = allFields.filter(
    item =>
      item !== 'isDeleted' &&
      item !== 'isActive' &&
      item !== 'createdAt' &&
      item !== 'updatedAt' &&
      item !== '_id' &&
      item !== '__v'
  )

  return filteredArray.reduce(
    (acc, field) => {
      let fieldExists = fields.find(e => {
        return e.fieldName === field
      })
      if (!fieldExists) {
        acc.status = false
        acc.message += `${field} is missing in fields array. `
      }
      return acc
    },
    { status: true, message: '' }
  )
}

const isModelNameValid = async modelName => {
  return await mongoose.modelNames().find(ele => {
    return ele.toLowerCase() === modelName.toLowerCase()
  })
}
const allFields = collectionName => {
  return Object.keys(mongoose.model(collectionName).schema.paths)
}
const checkBodyData = async (modelName, fields) => {
  try {
    let modelFound = await isModelNameValid(modelName)
    if (!modelFound) {
      return {
        message: `Invalid model name ${modelName}. It must be same as Schema's model name.`,
        status: false,
        data: []
      }
    }
    let fieldsFound = await allFields(modelFound)
    if (!fieldsFound || !fieldsFound.length) {
      return {
        message: `No fields found in schema.`,
        status: false,
        data: []
      }
    }
    let checkFieldsInBody = await isAllFieldsExists(fieldsFound, fields)
    if (!checkFieldsInBody.status) {
      return {
        message: checkFieldsInBody.message,
        status: false,
        data: []
      }
    }

    return { message: 'All Ok', status: true, data: fields }
  } catch (err) {
    return { message: 'Error Occured.', status: false, data: [] }
  }
}

const isActionMethodValid = async (actionName, method) => {
  return actionMethodEnum[actionName.toLowerCase()]?.toLowerCase() ===
    method.toLowerCase()
    ? true
    : false
}

module.exports = {
  isModelNameValid,
  isAllFieldsExists,
  checkBodyData,
  isActionMethodValid
}
