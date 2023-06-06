const DealerSupervisor = require('../model/DealerSupervisorSchema')
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One DealerSupervisor by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<DealerSupervisor>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
    return DealerSupervisor.findOne({ [fieldName]: fieldValue, isDeleted: false })
}
//-------------------------------------------
/**
 * Get One DealerSupervisor by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<DealerSupervisor>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
    return DealerSupervisor.findOne({ ...matchObj, isDeleted: false }, { ...projectObj })
}

//-------------------------------------------
/**
 * Create DealerSupervisor
 * @param {object} bodyData
 * @returns {Promise<DealerSupervisor>}
 */
const createNewData = async bodyData => {
    return DealerSupervisor.create({ ...bodyData })
}
//-------------------------------------------
/**
 * get by id DealerSupervisor
 * @param {ObjectId} id
 * @returns {Promise<DealerSupervisor>}
 */
const getById = async id => {
    return DealerSupervisor.findById(id)
}
//-------------------------------------------
/**
 * Update DealerSupervisor by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<DealerSupervisor>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
    return DealerSupervisor.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true })
}
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<DealerSupervisor>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
    return DealerSupervisor.findOneAndUpdate(
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
 * @returns {Promise<DealerSupervisor>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
    return DealerSupervisor.updateOne(
        { ...matchObj, isDeleted: false },
        { ...updateBody },
        { new: true }
    )
}
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<DealerSupervisor>}
 */
const getByIdAndDelete = async id => {
    return DealerSupervisor.findByIdAndDelete(id)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<DealerSupervisor>}
 */
const getOneAndDelete = async matchObj => {
    return DealerSupervisor.findOneAndUpdate(
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
 * @returns {Promise<DealerSupervisor>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
    return DealerSupervisor.find({ ...matchObj, isDeleted: false }, { ...projectObj })
}
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<DealerSupervisor>}
 */
const findAll = async () => {
    return DealerSupervisor.find()
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<DealerSupervisor>}
 */
const aggregateQuery = async aggregateQueryArray => {
    return DealerSupervisor.aggregate(aggregateQueryArray)
}
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<DealerSupervisor>}
 */
const createMany = async insertDataArray => {
    return DealerSupervisor.insertMany(insertDataArray)
}
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <DealerSupervisor> }
 */
const findCount = async matchObj => {
    return DealerSupervisor.find({ ...matchObj, isDeleted: false }).count()
}
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <DealerSupervisor> }
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
