const mongoose = require('mongoose')
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
const collectionNameArray = async modelName => {
  // Retrieve a list of all the collection names

  let collections = await mongoose.modelNames()

  let collectionExist = collections.find(ele => {
    return ele.toLowerCase() === modelName.toLowerCase()
  })

  if (!collectionExist) {
    return {
      status: false,
      message: 'Module does not exist in data base collection.',
      data: []
    }
  }

  // Retrieving the field names from the model schema

  let allFields = Object.keys(mongoose.model(collectionExist).schema.paths)
  console.log(allFields, 'allFields')
  return allFields
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
    let findAllFields = await allFields(modelFound)
    if (!allFields || !allFields.length) {
      return {
        message: `Invalid model name ${modelName}. It must be same as Schema's model name.`,
        status: false,
        data: []
      }
    }
    return { message: 'All Ok', status: true, data: [] }
  } catch {
    return { message: 'Error Occured.', status: false, data: [] }
  }
}

module.exports = {
  isModelNameValid,
  collectionNameArray,
  isAllFieldsExists
}
