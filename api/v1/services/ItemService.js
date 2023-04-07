const Item = require('../model/ItemSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One Item by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Item>}
 */
 const getOneBySingleField = async (fieldName, fieldValue) => {
  return Item.findOne({ [fieldName]: fieldValue, isDeleted: false })
  }
  //-------------------------------------------
  /**
 * Get One Item by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Item>}
 */
 const getOneByMultiField = async (matchObj, projectObj) => {
  return Item.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
  }
  
  //-------------------------------------------
  /**
 * Create Item
 * @param {object} bodyData
 * @returns {Promise<Item>}
 */
 const createNewData = async bodyData => {
  return Item.create({ ...bodyData })
  }
  //-------------------------------------------
  /**
 * get by id Item
 * @param {ObjectId} id
 * @returns {Promise<Item>}
 */
 const getById = async id => {
  return Item.findById(id)
  }
  //-------------------------------------------
  /**
 * Update Item by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Item>}
 */
 const getByIdAndUpdate = async (id, updateBody) => {
  return Item.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
  }
  //-------------------------------------------
  /**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Item>}
 */
 const getOneAndUpdate = async (matchObj, updateBody) => {
  return Item.findOneAndUpdate(
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
 * @returns {Promise<Item>}
 */
 const onlyUpdateOne = async (matchObj, updateBody) => {
  return Item.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
  }
  //-------------------------------------------
  /**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Item>}
 */
 const getByIdAndDelete = async id => {
  return Item.findByIdAndDelete(id)
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Item>}
 */
 const getOneAndDelete = async matchObj => {
  return Item.findOneAndUpdate(
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
 * @returns {Promise<Item>}
 */
 const findAllWithQuery = async (matchObj, projectObj) => {
  return Item.find({ ...matchObj, isDeleted: false }, { ...projectObj })
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @returns {Promise<Item>}
 */
 const findAll = async () => {
  return Item.find()
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Item>}
 */
 const aggregateQuery = async aggregateQueryArray => {
  return Item.aggregate(aggregateQueryArray)
  }
  //-------------------------------------------
  /**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Item>
                        }
 */
 const createMany = async insertDataArray => {
  return Item.insertMany(insertDataArray)
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
  return Item.find({ ...matchObj, isDeleted: false }).count()
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