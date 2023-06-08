const assetLocation = require('../model/AssetLocationSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One assetLocation by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<assetLocation>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
    return assetLocation.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One assetLocation by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<assetLocation>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
    return assetLocation.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create assetLocation
 * @param {object} bodyData
 * @returns {Promise<assetLocation>}
 */
const createNewData = async bodyData => {
    return assetLocation.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id assetLocation
 * @param {ObjectId} id
 * @returns {Promise<assetLocation>}
 */
const getById = async id => {
    return assetLocation.findById(id)
}
//-------------------------------------------
/**
 * Update assetLocation by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<assetLocation>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
    return assetLocation.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
}
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<assetLocation>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
    return assetLocation.findOneAndUpdate(
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
 * @returns {Promise<assetLocation>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
    return assetLocation.updateOne(
        { ...matchObj, isDeleted: false },
        { ...updateBody },
        { new: true }
    )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise <assetLocation>}
 */
const getByIdAndDelete = async id => {
    return assetLocation.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise <assetLocation>}
 */
const getOneAndDelete = async matchObj => {
    return assetLocation.findOneAndUpdate(
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
 * @returns {Promise <assetLocation> }
 */
const findAllWithQuery = async (matchObj, projectObj) => {
    return assetLocation.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise <assetLocation>}
 */
const findAll = async () => {
    return assetLocation.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise <assetLocation>}
 */
const aggregateQuery = async aggregateQueryArray => {
    return assetLocation.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise <assetLocation> }
 */
const createMany = async insertDataArray => {
    return assetLocation.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <assetLocation>}
 */
const findCount = async matchObj => {
    return assetLocation.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <assetLocation>}
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
