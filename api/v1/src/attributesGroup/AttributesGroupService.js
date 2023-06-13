const AttributesGroup = require('./AttributesGroupSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One AttributesGroup by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<AttributesGroup>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return AttributesGroup.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One AttributesGroup by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<AttributesGroup>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return AttributesGroup.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  )
}

//-------------------------------------------
/**
 * Create AttributesGroup
 * @param {object} bodyData
 * @returns {Promise<AttributesGroup>}
 */
const createNewData = async bodyData => {
  return AttributesGroup.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id AttributesGroup
 * @param {ObjectId} id
 * @returns {Promise<AttributesGroup>}
 */
const getById = async id => {
  return AttributesGroup.findById(id)
}
//-------------------------------------------
/**
 * Update AttributesGroup by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<AttributesGroup>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return AttributesGroup.findByIdAndUpdate(
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
 * @returns {Promise<AttributesGroup>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return AttributesGroup.findOneAndUpdate(
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
 * @returns {Promise<AttributesGroup>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return AttributesGroup.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<AttributesGroup>}
 */
const getByIdAndDelete = async id => {
  return AttributesGroup.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<AttributesGroup>}
 */
const getOneAndDelete = async matchObj => {
  return AttributesGroup.findOneAndUpdate(
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
 * @returns {Promise<AttributesGroup>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return AttributesGroup.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  )
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<AttributesGroup>}
 */
const findAll = async () => {
  return AttributesGroup.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<AttributesGroup>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return AttributesGroup.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<AttributesGroup>}
 */
const createMany = async insertDataArray => {
  return AttributesGroup.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <AttributesGroup> }
 */
const findCount = async matchObj => {
  return AttributesGroup.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <AttributeGroup>}
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
