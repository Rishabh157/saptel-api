const allocation = require('./AllocationSchema')
const { combineObjects } = require('../../helper/utils')

//-------------------------------------------
/**
 * Get One allocation by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<allocation>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
    return allocation.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One allocation by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<allocation>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
    return allocation.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create allocation
 * @param {object} bodyData
 * @returns {Promise<allocation>}
 */
const createNewData = async bodyData => {
    return allocation.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id allocation
 * @param {ObjectId} id
 * @returns {Promise<allocation>}
 */
const getById = async id => {
    return allocation.findById(id)
}
//-------------------------------------------
/**
 * Update allocation by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<allocation>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
    return allocation.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
}
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<allocation>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
    return allocation.findOneAndUpdate(
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
 * @returns {Promise<allocation>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
    return allocation.updateOne(
        { ...matchObj, isDeleted: false },
        { ...updateBody },
        { new: true }
    )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise <allocation>}
 */
const getByIdAndDelete = async id => {
    return allocation.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise <allocation>}
 */
const getOneAndDelete = async matchObj => {
    return allocation.findOneAndUpdate(
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
 * @returns {Promise <allocation> }
 */
const findAllWithQuery = async (matchObj, projectObj) => {
    return allocation.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise <allocation>}
 */
const findAll = async () => {
    return allocation.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise <allocation>}
 */
const aggregateQuery = async aggregateQueryArray => {
    return allocation.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise <allocation> }
 */
const createMany = async insertDataArray => {
    return allocation.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <allocation>}
 */
const findCount = async matchObj => {
    return allocation.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <allocation>}
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
