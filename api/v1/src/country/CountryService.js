const Country = require('./CountrySchema')
const { combineObjects } = require('../../helper/utils')

//-------------------------------------------
/**
 * Get One Country by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Country>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Country.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One Country by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Country>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Country.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create Country
 * @param {object} bodyData
 * @returns {Promise<Country>}
 */
const createNewData = async bodyData => {
  return Country.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id Country
 * @param {ObjectId} id
 * @returns {Promise<Country>}
 */
const getById = async id => {
  return Country.findById(id)
}
//-------------------------------------------
/**
 * Update Country by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Country>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Country.findByIdAndUpdate(
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
 * @returns {Promise<Country>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Country.findOneAndUpdate(
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
 * @returns {Promise<Country>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Country.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Country>}
 */
const getByIdAndDelete = async id => {
  return Country.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Country>}
 */
const getOneAndDelete = async matchObj => {
  return Country.findOneAndUpdate(
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
 * @returns {Promise <Country>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Country.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise <Country>}
 */
const findAll = async () => {
  return Country.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise <Country>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return Country.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise <Country>}
 */
const createMany = async insertDataArray => {
  return Country.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <Country> }
 */
const findCount = async matchObj => {
  return Country.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <Country> }
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
