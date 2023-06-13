const CartonBox = require('./CartonBoxSchema')
const { combineObjects } = require('../../helper/utils')

//-------------------------------------------
/**
 * Get One CartonBox by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<CartonBox>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return CartonBox.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One CartonBox by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<CartonBox>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return CartonBox.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create CartonBox
 * @param {object} bodyData
 * @returns {Promise<CartonBox>}
 */
const createNewData = async bodyData => {
  return CartonBox.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id CartonBox
 * @param {ObjectId} id
 * @returns {Promise<CartonBox>}
 */
const getById = async id => {
  return CartonBox.findById(id)
}
//-------------------------------------------
/**
 * Update CartonBox by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<CartonBox>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return CartonBox.findByIdAndUpdate(
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
 * @returns {Promise<CartonBox>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return CartonBox.findOneAndUpdate(
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
 * @returns {Promise<CartonBox>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return CartonBox.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<CartonBox>}
 */
const getByIdAndDelete = async id => {
  return CartonBox.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<CartonBox>}
 */
const getOneAndDelete = async matchObj => {
  return CartonBox.findOneAndUpdate(
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
 * @returns {Promise<CartonBox>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return CartonBox.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<CartonBox>}
 */
const findAll = async () => {
  return CartonBox.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<CartonBox>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return CartonBox.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<CartonBox>}
 */
const createMany = async insertDataArray => {
  return CartonBox.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <CartonBox> }
 */
const findCount = async matchObj => {
  return CartonBox.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <CartonBox>}
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
