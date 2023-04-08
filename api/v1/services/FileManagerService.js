const FileManager = require('../model/FileManagerSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One FileManager by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<FileManager>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return FileManager.findOne({ [fieldName]: fieldValue, isDeleted: false })
}

//-------------------------------------------

/**
 * Get One FileManager by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<FileManager>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return FileManager.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  )
}

//-------------------------------------------

/**
 * Create FileManager
 * @param {object} bodyData
 * @returns {Promise<FileManager>}
 */
const createNewData = async bodyData => {
  return FileManager.create({ ...bodyData })
}
//-------------------------------------------

/**
 * get by id FileManager
 * @param {ObjectId} id
 * @returns {Promise<FileManager>}
 */
const getById = async id => {
  return FileManager.findById(id)
}
//-------------------------------------------

/**
 * Update FileManager by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<FileManager>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return FileManager.findByIdAndUpdate(
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
 * @returns {Promise<FileManager>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return FileManager.findOneAndUpdate(
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
 * @returns {Promise<FileManager>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return FileManager.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<FileManager>}
 */
const getByIdAndDelete = async id => {
  return FileManager.findByIdAndDelete(id)
}

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<FileManager>}
 */
const getOneAndDelete = async matchObj => {
  return FileManager.findOneAndUpdate(
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
 * @returns {Promise<FileManager>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return FileManager.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<FileManager>}
 */
const findAll = async () => {
  return FileManager.find()
}

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<FileManager>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return FileManager.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<FileManager>}
 */
const createMany = async insertDataArray => {
  return FileManager.insertMany(insertDataArray)
}
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Machine>}
 */
const findCount = async matchObj => {
  return FileManager.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<User>}
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

  // let exists = mappedArray.some(elem => elem.exists)
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
