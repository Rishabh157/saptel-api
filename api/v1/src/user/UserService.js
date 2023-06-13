const User = require('./UserSchema')
const { combineObjects } = require('../../helper/utils')

//-------------------------------------------
/**
 * Get One User by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<User>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return User.findOne({ [fieldName]: fieldValue, isDeleted: false })
}

//-------------------------------------------

/**
 * Get One User by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<User>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return User.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------

/**
 * Create User
 * @param {object} bodyData
 * @returns {Promise<User>}
 */
const createNewData = async bodyData => {
  return User.create({ ...bodyData })
}
//-------------------------------------------

/**
 * get by id User
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getById = async id => {
  return User.findById(id)
}
//-------------------------------------------

/**
 * Update User by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return User.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
}
//-------------------------------------------

/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return User.findOneAndUpdate(
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
 * @returns {Promise<User>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return User.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getByIdAndDelete = async id => {
  return User.findByIdAndDelete(id)
}

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<User>}
 */
const getOneAndDelete = async matchObj => {
  return User.findOneAndUpdate(
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
 * @returns {Promise<User>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return User.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<User>}
 */
const findAll = async () => {
  return User.find()
}

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<User>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return User.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<User>}
 */
const createMany = async insertDataArray => {
  return User.insertMany(insertDataArray)
}
//-------------------------------------------

/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<User>}
 */
const findCount = async matchObj => {
  return User.find({ ...matchObj, isDeleted: false }).count()
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
