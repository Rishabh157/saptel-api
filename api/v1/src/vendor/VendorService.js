const Vendor = require('./VendorSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One Vendor by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Vendor>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Vendor.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One Vendor by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Vendor>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Vendor.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create Vendor
 * @param {object} bodyData
 * @returns {Promise<Vendor>}
 */
const createNewData = async bodyData => {
  return Vendor.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id Vendor
 * @param {ObjectId} id
 * @returns {Promise<Vendor>}
 */
const getById = async id => {
  return Vendor.findById(id)
}
//-------------------------------------------
/**
 * Update Vendor by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Vendor>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Vendor.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
}
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Vendor>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Vendor.findOneAndUpdate(
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
 * @returns {Promise<Vendor>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Vendor.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Vendor>}
 */
const getByIdAndDelete = async id => {
  return Vendor.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Vendor>}
 */
const getOneAndDelete = async matchObj => {
  return Vendor.findOneAndUpdate(
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
 * @returns {Promise<Vendor>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Vendor.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Vendor>}
 */
const findAll = async () => {
  return Vendor.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Vendor>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return Vendor.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Vendor>}
 */
const createMany = async insertDataArray => {
  return Vendor.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Vendor>}
 */
const findCount = async matchObj => {
  return Vendor.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<Vendor>}
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
