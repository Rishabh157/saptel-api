const Language = require('./LanguageSchema')
const { combineObjects } = require('../../helper/utils')

//-------------------------------------------
/**
 * Get One Language by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Language>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Language.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One Language by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Language>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Language.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create Language
 * @param {object} bodyData
 * @returns {Promise<Language>}
 */
const createNewData = async bodyData => {
  return Language.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id Language
 * @param {ObjectId} id
 * @returns {Promise<Language>}
 */
const getById = async id => {
  return Language.findById(id)
}
//-------------------------------------------
/**
 * Update Language by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Language>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Language.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Language>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Language.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Language>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Language.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Language>}
 */
const getByIdAndDelete = async id => {
  return Language.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Language>}
 */
const getOneAndDelete = async matchObj => {
  return Language.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  )
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Language>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Language.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Language>}
 */
const findAll = async () => {
  return Language.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Language>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return Language.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Language>}
 */
const createMany = async insertDataArray => {
  return Language.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Language>}
 */
const findCount = async matchObj => {
  return Language.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<Language>}
 */
const isExists = async (filterArray, exceptIds = false, combined = false) => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray)

    if (exceptIds) {
      combinedObj['_id'] = { $nin: exceptIds }
    }

    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`
      }
    }
    return { exists: false, existsSummary: '' }
  }

  let mappedArray = await Promise.all(
    filterArray.map(async element => {
      if (exceptIds) {
        element['_id'] = { $nin: exceptIds }
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] }
      }
      return { exists: false, fieldName: Object.keys(element)[0] }
    })
  )

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `
      }
      return acc
    },
    { exists: false, existsSummary: '' }
  )
}
//-------------------------------------------
module.exports = {
  getOneBySingleField,
  getOneByMultiField,
  createNewData,
  getById,
  getByIdAndUpdate,
  getOneAndUpdate,
  getByIdAndDelete,
  getOneAndDelete,
  aggregateQuery,
  findAllWithQuery,
  findAll,
  onlyUpdateOne,
  createMany,
  findCount,
  isExists
}
