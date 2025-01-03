const httpStatus = require('http-status')
const OTP = require('./OtpSchema')
const ApiError = require('../../../utils/apiErrorUtils')

//-------------------------------------------
/**
 * Get One OTP by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<OTP>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return OTP.findOne({ [fieldName]: fieldValue, isDeleted: false })
}

//-------------------------------------------

/**
 * Get One OTP by multiple Fields field
 * @param {object} matchObj
 * @returns {Promise<OTP>}
 */
const getOneByMultiField = async matchObj => {
  return OTP.findOne({ ...matchObj, isDeleted: false })
}

//-------------------------------------------

/**
 * Create OTP
 * @param {object} bodyData
 * @returns {Promise<OTP>}
 */
const createNewData = async bodyData => {
  return OTP.create({ ...bodyData })
}
//-------------------------------------------

/**
 * Create OTP
 * @param {object} matchObj
 * @param {object} bodyData
 * @returns {Promise<OTP>}
 */
const upsertData = async (matchObj, bodyData) => {
  return OTP.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...bodyData },
    {
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      new: true
    }
  )
}
//-------------------------------------------

/**
 * get by id OTP
 * @param {ObjectId} id
 * @returns {Promise<OTP>}
 */
const getById = async id => {
  return OTP.findById(id)
}
//-------------------------------------------

/**
 * Update OTP by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<OTP>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return OTP.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
}
//-------------------------------------------

/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<OTP>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return OTP.findOneAndUpdate(
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
 * @returns {Promise<OTP>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return OTP.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<OTP>}
 */
const getByIdAndDelete = async id => {
  return OTP.findByIdAndDelete(id)
}

//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<OTP>}
 */
const getOneIdAndDelete = async matchObj => {
  return OTP.findOneAndDelete({ ...matchObj, isDeleted: false })
}

//-------------------------------------------

/**
 * find one and delete
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<OTP>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return OTP.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------

/**
 * find one and delete
 * @returns {Promise<OTP>}
 */
const findAll = async () => {
  return OTP.find({ isDeleted: false })
}

//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<OTP>}
 */
const aggregateQuery = async aggregateQueryArray => {
  return OTP.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<OTP>}
 */
const createMany = async insertDataArray => {
  return OTP.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<Otp>}
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
  getOneIdAndDelete,
  aggregateQuery,
  findAllWithQuery,
  findAll,
  onlyUpdateOne,
  createMany,
  upsertData
}
