const AsrRequest = require('../model/AsrRequestSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One AsrRequest by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<AsrRequest>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return AsrRequest.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One AsrRequest by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<AsrRequest>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return AsrRequest.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  )
}

//-------------------------------------------
/**
 * Create AsrRequest
 * @param {object} bodyData
 * @returns {Promise<AsrRequest>}
 */
const createNewData = async bodyData => {
  return AsrRequest.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id AsrRequest
 * @param {ObjectId} id
 * @returns {Promise<AsrRequest>}
 */
const getById = async id => {
  return AsrRequest.findById(id)
}
//-------------------------------------------
/**
 * Update AsrRequest by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<AsrRequest>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return AsrRequest.findByIdAndUpdate(
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
 * @returns {Promise<AsrRequest>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return AsrRequest.findOneAndUpdate(
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
 * @returns {Promise<AsrRequest>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return AsrRequest.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<AsrRequest>}
 */
const getByIdAndDelete = async id => {
  return AsrRequest.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<AsrRequest>}
 */
const getOneAndDelete = async matchObj => {
  return AsrRequest.findOneAndUpdate(
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
 * @returns {Promise<AsrRequest>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return AsrRequest.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<AsrRequest>}
 */
const findAll = async () => {
  return AsrRequest.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<AsrRequest>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return AsrRequest.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<AsrRequest>}
 */
const createMany = async insertDataArray => {
  return AsrRequest.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise Machine>
                            }
 */
const findCount = async matchObj => {
  return AsrRequest.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<AsrRequest>}
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
