const Product = require('../model/ProductSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One Product by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Product>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Product.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One Product by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Product>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Product.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create Product
 * @param {object} bodyData
 * @returns {Promise<Product>}
 */
const createNewData = async bodyData => {
  return Product.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id Product
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getById = async id => {
  return Product.findById(id)
}
//-------------------------------------------
/**
 * Update Product by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Product>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Product.findByIdAndUpdate(
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
 * @returns {Promise<Product>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Product.findOneAndUpdate(
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
 * @returns {Promise<Product>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Product.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Product>}
 */
const getByIdAndDelete = async id => {
  return Product.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Product>}
 */
const getOneAndDelete = async matchObj => {
  return Product.findOneAndUpdate(
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
 * @returns {Promise<Product>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Product.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Product>}
 */
const findAll = async () => {
  return Product.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Product>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return Product.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Product>}
 */
const createMany = async insertDataArray => {
  return Product.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Product>}
 */
const findCount = async matchObj => {
  return Product.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<Product>}
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
