const Pincode = require('./PincodeSchema')
const { combineObjects } = require('../../helper/utils')

//-------------------------------------------
/**
 * Get One Pincode by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Pincode>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Pincode.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One Pincode by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Pincode>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Pincode.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create Pincode
 * @param {object} bodyData
 * @returns {Promise<Pincode>}
 */
const createNewData = async bodyData => {
  return Pincode.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id Pincode
 * @param {ObjectId} id
 * @returns {Promise<Pincode>}
 */
const getById = async id => {
  return Pincode.findById(id)
}
//-------------------------------------------
/**
 * Update Pincode by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Pincode>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Pincode.findByIdAndUpdate(
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
 * @returns {Promise<Pincode>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Pincode.findOneAndUpdate(
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
 * @returns {Promise<Pincode>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Pincode.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Pincode>}
 */
const getByIdAndDelete = async id => {
  return Pincode.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Pincode>}
 */
const getOneAndDelete = async matchObj => {
  return Pincode.findOneAndUpdate(
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
 * @returns {Promise<Pincode>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Pincode.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Pincode>}
 */
const findAll = async () => {
  return Pincode.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Pincode>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return Pincode.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Pincode>}
 */
const createMany = async insertDataArray => {
  return Pincode.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Pincode>}
 */
const findCount = async matchObj => {
  return Pincode.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<Pincode>}
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
