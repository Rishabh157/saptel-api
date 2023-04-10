const Company = require('../model/CompanySchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One Company by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Company>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Company.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One Company by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Company>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Company.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create Company
 * @param {object} bodyData
 * @returns {Promise<Company>}
 */
const createNewData = async bodyData => {
  return Company.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id Company
 * @param {ObjectId} id
 * @returns {Promise<Company>}
 */
const getById = async id => {
  return Company.findById(id)
}
//-------------------------------------------
/**
 * Update Company by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Company>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Company.findByIdAndUpdate(
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
 * @returns {Promise<Company>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Company.findOneAndUpdate(
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
 * @returns {Promise<Company>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Company.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Company>}
 */
const getByIdAndDelete = async id => {
  return Company.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Company>}
 */
const getOneAndDelete = async matchObj => {
  return Company.findOneAndUpdate(
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
 * @returns {Promise<Company>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Company.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Company>}
 */
const findAll = async () => {
  return Company.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Company>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return Company.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Company>}
 */
const createMany = async insertDataArray => {
  return Company.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <Company> }
 */
const findCount = async matchObj => {
  return Company.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <Company>}
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
