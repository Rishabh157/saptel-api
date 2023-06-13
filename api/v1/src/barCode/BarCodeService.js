const BarCode = require('./BarCodeSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One BarCode by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<BarCode>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return BarCode.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One BarCode by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<BarCode>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return BarCode.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create BarCode
 * @param {object} bodyData
 * @returns {Promise<BarCode>}
 */
const createNewData = async bodyData => {
  return BarCode.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id BarCode
 * @param {ObjectId} id
 * @returns {Promise<BarCode>}
 */
const getById = async id => {
  return BarCode.findById(id)
}
//-------------------------------------------
/**
 * Update BarCode by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<BarCode>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return BarCode.findByIdAndUpdate(
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
 * @returns {Promise<BarCode>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return BarCode.findOneAndUpdate(
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
 * @returns {Promise<BarCode>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return BarCode.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<BarCode>}
 */
const getByIdAndDelete = async id => {
  return BarCode.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<BarCode>}
 */
const getOneAndDelete = async matchObj => {
  return BarCode.findOneAndUpdate(
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
 * @returns {Promise<BarCode>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return BarCode.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<BarCode>}
 */
const findAll = async () => {
  return BarCode.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<BarCode>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return BarCode.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<BarCode>}
 */
const createMany = async insertDataArray => {
  return BarCode.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <BarCode> }
 */
const findCount = async matchObj => {
  return BarCode.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <BarCode> }
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
