const userRole = require('../model/UserRoleSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One userRole by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<userRole>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
    return userRole.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One userRole by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<userRole>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
    return userRole.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create userRole
 * @param {object} bodyData
 * @returns {Promise<userRole>}
 */
const createNewData = async bodyData => {
    return userRole.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id userRole
 * @param {ObjectId} id
 * @returns {Promise<userRole>}
 */
const getById = async id => {
    return userRole.findById(id)
}
//-------------------------------------------
/**
 * Update userRole by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<userRole>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
    return userRole.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
}
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<userRole>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
    return userRole.findOneAndUpdate(
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
 * @returns {Promise<userRole>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
    return userRole.updateOne(
        { ...matchObj, isDeleted: false },
        { ...updateBody },
        { new: true }
    )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<userRole>}
 */
const getByIdAndDelete = async id => {
    return userRole.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<userRole>}
 */
const getOneAndDelete = async matchObj => {
    return userRole.findOneAndUpdate(
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
 * @returns {Promise<userRole>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
    return userRole.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<userRole>}
 */
const findAll = async () => {
    return userRole.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<userRole>}
 */
const aggregateQuery = async aggregateQueryArray => {
    return userRole.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<userRole>}
 */
const createMany = async insertDataArray => {
    return userRole.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <userRole> }
 */
const findCount = async matchObj => {
    return userRole.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <userRole> }
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
