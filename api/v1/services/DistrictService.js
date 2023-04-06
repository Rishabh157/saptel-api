const District = require('../model/DistrictSchema')
const {...combinedObj } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One District by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<District>}
 */
 const getOneBySingleField = async (fieldName, fieldValue) => {
  return District.findOne({ [fieldName]: fieldValue, isDeleted: false })
  }
  //-------------------------------------------
  /**
 * Get One District by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<District>}
 */
 const getOneByMultiField = async (matchObj, projectObj) => {
  return District.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
  }
  
  //-------------------------------------------
  /**
 * Create District
 * @param {object} bodyData
 * @returns {Promise<District>}
 */
 const createNewData = async bodyData => {
  return District.create({ ...bodyData })
  }
  //-------------------------------------------
  /**
 * get by id District
 * @param {ObjectId} id
 * @returns {Promise<District>}
 */
 const getById = async id => {
  return District.findById(id)
  }
  //-------------------------------------------
  /**
 * Update District by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<District>}
 */
 const getByIdAndUpdate = async (id, updateBody) => {
  return District.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
  }
  //-------------------------------------------
  /**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<District>}
 */
 const getOneAndUpdate = async (matchObj, updateBody) => {
  return District.findOneAndUpdate(
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
 * @returns {Promise<District>}
 */
 const onlyUpdateOne = async (matchObj, updateBody) => {
  return District.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
  }
  //-------------------------------------------
  /**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<District>}
 */
 const getByIdAndDelete = async id => {
  return District.findByIdAndDelete(id)
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<District>}
 */
 const getOneAndDelete = async matchObj => {
  return District.findOneAndUpdate(
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
 * @returns {Promise<District>}
 */
 const findAllWithQuery = async (matchObj, projectObj) => {
  return District.find({ ...matchObj, isDeleted: false }, { ...projectObj })
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @returns {Promise<District>}
 */
 const findAll = async () => {
  return District.find()
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<District>}
 */
 const aggregateQuery = async aggregateQueryArray => {
  return District.aggregate(aggregateQueryArray)
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<District>}
 */
 const createMany = async insertDataArray => {
  return District.insertMany(insertDataArray)
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
  return District.find({ ...matchObj, isDeleted: false }).count()
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