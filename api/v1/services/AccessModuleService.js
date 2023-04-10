const Accessmodule = require('../model/AccessModuleSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One Accessmodule by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Accessmodule>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Accessmodule.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One Accessmodule by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Accessmodule>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Accessmodule.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  )
}

//-------------------------------------------
/**
 * Create Accessmodule
 * @param {object} bodyData
 * @returns {Promise<Accessmodule>}
 */
const createNewData = async bodyData => {
  return Accessmodule.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id Accessmodule
 * @param {ObjectId} id
 * @returns {Promise<Accessmodule>}
 */
const getById = async id => {
  return Accessmodule.findById(id)
}
//-------------------------------------------
/**
 * Update Accessmodule by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Accessmodule>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Accessmodule.findByIdAndUpdate(
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
 * @returns {Promise<Accessmodule>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Accessmodule.findOneAndUpdate(
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
 * @returns {Promise<Accessmodule>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Accessmodule.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Accessmodule>}
 */
const getByIdAndDelete = async id => {
  return Accessmodule.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Accessmodule>}
 */
const getOneAndDelete = async matchObj => {
  return Accessmodule.findOneAndUpdate(
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
 * @returns {Promise<Accessmodule>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Accessmodule.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Accessmodule>}
 */
const findAll = async () => {
  return Accessmodule.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Accessmodule>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return Accessmodule.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Accessmodule>}
 */
const createMany = async insertDataArray => {
  return Accessmodule.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Accessmodule>}
 */
const findCount = async matchObj => {
  return Accessmodule.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<Accessmodule>}
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
