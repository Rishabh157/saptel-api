const Scheme = require('../model/SchemeSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One Scheme by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Scheme>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Scheme.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One Scheme by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Scheme>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Scheme.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create Scheme
 * @param {object} bodyData
 * @returns {Promise<Scheme>}
 */
const createNewData = async bodyData => {
  return Scheme.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id Scheme
 * @param {ObjectId} id
 * @returns {Promise<Scheme>}
 */
const getById = async id => {
  return Scheme.findById(id)
}
//-------------------------------------------
/**
 * Update Scheme by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Scheme>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Scheme.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
}
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Scheme>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Scheme.findOneAndUpdate(
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
 * @returns {Promise<Scheme>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Scheme.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Scheme>}
 */
const getByIdAndDelete = async id => {
  return Scheme.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Scheme>}
 */
const getOneAndDelete = async matchObj => {
  return Scheme.findOneAndUpdate(
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
 * @returns {Promise<Scheme>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Scheme.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Scheme>}
 */
const findAll = async () => {
  return Scheme.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Scheme>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return Scheme.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Scheme>}
 */
const createMany = async insertDataArray => {
  return Scheme.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Scheme>}
 */
const findCount = async matchObj => {
  return Scheme.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<Scheme>}
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
