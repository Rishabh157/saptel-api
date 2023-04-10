const ProductCategory = require('../model/ProductCategorySchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One ProductCategory by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<ProductCategory>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return ProductCategory.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One ProductCategory by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<ProductCategory>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return ProductCategory.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  )
}

//-------------------------------------------
/**
 * Create ProductCategory
 * @param {object} bodyData
 * @returns {Promise<ProductCategory>}
 */
const createNewData = async bodyData => {
  return ProductCategory.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id ProductCategory
 * @param {ObjectId} id
 * @returns {Promise<ProductCategory>}
 */
const getById = async id => {
  return ProductCategory.findById(id)
}
//-------------------------------------------
/**
 * Update ProductCategory by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<ProductCategory>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return ProductCategory.findByIdAndUpdate(
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
 * @returns {Promise<ProductCategory>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return ProductCategory.findOneAndUpdate(
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
 * @returns {Promise<ProductCategory>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return ProductCategory.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<ProductCategory>}
 */
const getByIdAndDelete = async id => {
  return ProductCategory.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<ProductCategory>}
 */
const getOneAndDelete = async matchObj => {
  return ProductCategory.findOneAndUpdate(
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
 * @returns {Promise<ProductCategory>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return ProductCategory.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  )
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<ProductCategory>}
 */
const findAll = async () => {
  return ProductCategory.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<ProductCategory>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return ProductCategory.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<ProductCategory>}
 */
const createMany = async insertDataArray => {
  return ProductCategory.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<ProductCategory>}
 */
const findCount = async matchObj => {
  return ProductCategory.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<ProductCategory>}
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
