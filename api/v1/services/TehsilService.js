const Tehsil = require("../model/TehsilSchema");
const { combineObjects } = require('../helper/utils')

//-------------------------------------------
/**
 * Get One Tehsil by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Tehsil>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Tehsil.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------
/**
 * Get One Tehsil by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Tehsil>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Tehsil.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------
/**
 * Create Tehsil
 * @param {object} bodyData
 * @returns {Promise<Tehsil>}
 */
const createNewData = async (bodyData) => {
  return Tehsil.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id Tehsil
 * @param {ObjectId} id
 * @returns {Promise<Tehsil>}
 */
const getById = async (id) => {
  return Tehsil.findById(id);
};
//-------------------------------------------
/**
 * Update Tehsil by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Tehsil>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Tehsil.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Tehsil>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Tehsil.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Tehsil>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Tehsil.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Tehsil>}
 */
const getByIdAndDelete = async (id) => {
  return Tehsil.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Tehsil>}
 */
const getOneAndDelete = async (matchObj) => {
  return Tehsil.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  );
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Tehsil>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Tehsil.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Tehsil>}
 */
const findAll = async () => {
  return Tehsil.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Tehsil>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return Tehsil.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Tehsil>}
 */
const createMany = async (insertDataArray) => {
  return Tehsil.insertMany(insertDataArray);
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise
                          <Machine>
                            }
 */
const findCount = async (matchObj) => {
  return Tehsil.find({ ...matchObj, isDeleted: false }).count();
};
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
    let combinedObj = await combineObjects(filterArray);

    if (exceptIds) {
      combinedObj["_id"] = { $nin: exceptIds };
    }
    if (await getOneByMultiField({ ...combinedObj })) {
      return { exists: true, existsSummary: "Data already exist." };
    }
    return { exists: false, existsSummary: "" };
  }

  let mappedArray = await Promise.all(
    filterArray.map(async (element) => {
      if (exceptIds) {
        element["_id"] = { $nin: exceptIds };
      }
      if (await getOneByMultiField({ ...element })) {
        return { exists: true, fieldName: Object.keys(element)[0] };
      }
      return { exists: false, fieldName: Object.keys(element)[0] };
    })
  );

  return mappedArray.reduce(
    (acc, ele) => {
      if (ele.exists) {
        acc.exists = true;
        acc.existsSummary += `${ele.fieldName.toLowerCase()} already exist. `;
      }
      return acc;
    },
    { exists: false, existsSummary: "" }
  );
};
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
  isExists,
};
