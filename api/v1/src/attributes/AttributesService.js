const Attributes = require('./AttributesSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One Attributes by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Attributes>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Attributes.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One Attributes by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Attributes>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Attributes.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  )
}

//-------------------------------------------
/**
 * Create Attributes
 * @param {object} bodyData
 * @returns {Promise<Attributes>}
 */
const createNewData = async bodyData => {
  return Attributes.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id Attributes
 * @param {ObjectId} id
 * @returns {Promise<Attributes>}
 */
const getById = async id => {
  return Attributes.findById(id)
}
//-------------------------------------------
/**
 * Update Attributes by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Attributes>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Attributes.findByIdAndUpdate(
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
 * @returns {Promise<Attributes>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Attributes.findOneAndUpdate(
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
 * @returns {Promise<Attributes>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Attributes.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Attributes>}
 */
const getByIdAndDelete = async id => {
  return Attributes.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Attributes>}
 */
const getOneAndDelete = async matchObj => {
  return Attributes.findOneAndUpdate(
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
 * @returns {Promise<Attributes>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Attributes.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Attributes>}
 */
const findAll = async () => {
  return Attributes.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Attributes>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return Attributes.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Attributes>}
 */
const createMany = async insertDataArray => {
  return Attributes.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <Attributes> }
 */
const findCount = async matchObj => {
  return Attributes.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <Attributes> }
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
