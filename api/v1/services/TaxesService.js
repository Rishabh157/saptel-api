const Taxes = require('../model/TaxesSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One Taxes by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Taxes>}
 */
 const getOneBySingleField = async (fieldName, fieldValue) => {
  return Taxes.findOne({ [fieldName]: fieldValue, isDeleted: false })
  }
  //-------------------------------------------
  /**
 * Get One Taxes by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Taxes>}
 */
 const getOneByMultiField = async (matchObj, projectObj) => {
  return Taxes.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
  }
  
  //-------------------------------------------
  /**
 * Create Taxes
 * @param {object} bodyData
 * @returns {Promise<Taxes>}
 */
 const createNewData = async bodyData => {
  return Taxes.create({ ...bodyData })
  }
  //-------------------------------------------
  /**
 * get by id Taxes
 * @param {ObjectId} id
 * @returns {Promise<Taxes>}
 */
 const getById = async id => {
  return Taxes.findById(id)
  }
  //-------------------------------------------
  /**
 * Update Taxes by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Taxes>}
 */
 const getByIdAndUpdate = async (id, updateBody) => {
  return Taxes.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
  }
  //-------------------------------------------
  /**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Taxes>}
 */
 const getOneAndUpdate = async (matchObj, updateBody) => {
  return Taxes.findOneAndUpdate(
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
 * @returns {Promise<Taxes>}
 */
 const onlyUpdateOne = async (matchObj, updateBody) => {
  return Taxes.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
  }
  //-------------------------------------------
  /**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Taxes>}
 */
 const getByIdAndDelete = async id => {
  return Taxes.findByIdAndDelete(id)
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Taxes>}
 */
 const getOneAndDelete = async matchObj => {
  return Taxes.findOneAndUpdate(
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
 * @returns {Promise<Taxes>}
 */
 const findAllWithQuery = async (matchObj, projectObj) => {
  return Taxes.find({ ...matchObj, isDeleted: false }, { ...projectObj })
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @returns {Promise<Taxes>}
 */
 const findAll = async () => {
  return Taxes.find()
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Taxes>}
 */
 const aggregateQuery = async aggregateQueryArray => {
  return Taxes.aggregate(aggregateQueryArray)
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Taxes>}
 */
 const createMany = async insertDataArray => {
  return Taxes.insertMany(insertDataArray)
  }
  //-------------------------------------------
  /**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise
                          <Machine>
                            }
 */
 const findCount = async matchObj => {
  return Taxes.find({ ...matchObj, isDeleted: false }).count()
  }
  //-------------------------------------------
  /**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise
                            <User>
                              }
 */
 const isExists = async (filterArray, exceptIds = false, combined = false) => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray)

    if (exceptIds) {
      combinedObj['_id'] = { $nin: exceptIds }
    }
    if (await getOneByMultiField({ ...combinedObj })) {
      return { exists: true, existsSummary: 'Data already exist.' }
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