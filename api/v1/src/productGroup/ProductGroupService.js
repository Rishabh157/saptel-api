const ProductGroup = require('./ProductGroupSchema')
const { combineObjects } = require('../../helper/utils')

//-------------------------------------------
/**
 * Get One ProductGroup by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<ProductGroup>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return ProductGroup.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One ProductGroup by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<ProductGroup>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return ProductGroup.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  )
}

//-------------------------------------------
/**
 * Create ProductGroup
 * @param {object} bodyData
 * @returns {Promise<ProductGroup>}
 */
const createNewData = async bodyData => {
  return ProductGroup.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id ProductGroup
 * @param {ObjectId} id
 * @returns {Promise<ProductGroup>}
 */
const getById = async id => {
  return ProductGroup.findById(id)
}
//-------------------------------------------
/**
 * Update ProductGroup by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<ProductGroup>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return ProductGroup.findByIdAndUpdate(
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
 * @returns {Promise<ProductGroup>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return ProductGroup.findOneAndUpdate(
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
 * @returns {Promise<ProductGroup>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return ProductGroup.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<ProductGroup>}
 */
const getByIdAndDelete = async id => {
  return ProductGroup.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<ProductGroup>}
 */
const getOneAndDelete = async matchObj => {
  return ProductGroup.findOneAndUpdate(
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
 * @returns {Promise<ProductGroup>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return ProductGroup.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<ProductGroup>}
 */
const findAll = async () => {
  return ProductGroup.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<ProductGroup>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return ProductGroup.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<ProductGroup>}
 */
const createMany = async insertDataArray => {
  return ProductGroup.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<ProductGroup>}
 */
const findCount = async matchObj => {
  return ProductGroup.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<ProductGroup>}
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
