const Dealer = require('../model/DealerSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One Dealer by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Dealer>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Dealer.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One Dealer by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Dealer>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Dealer.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create Dealer
 * @param {object} bodyData
 * @returns {Promise<Dealer>}
 */
const createNewData = async bodyData => {
  return Dealer.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id Dealer
 * @param {ObjectId} id
 * @returns {Promise<Dealer>}
 */
const getById = async id => {
  return Dealer.findById(id)
}
//-------------------------------------------
/**
 * Update Dealer by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Dealer>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Dealer.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
}
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Dealer>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Dealer.findOneAndUpdate(
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
 * @returns {Promise<Dealer>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Dealer.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Dealer>}
 */
const getByIdAndDelete = async id => {
  return Dealer.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Dealer>}
 */
const getOneAndDelete = async matchObj => {
  return Dealer.findOneAndUpdate(
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
 * @returns {Promise<Dealer>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Dealer.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Dealer>}
 */
const findAll = async () => {
  return Dealer.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Dealer>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return Dealer.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Dealer>}
 */
const createMany = async insertDataArray => {
  return Dealer.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <Dealer> }
 */
const findCount = async matchObj => {
  return Dealer.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <Dealer> }
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
