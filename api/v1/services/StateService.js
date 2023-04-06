const State = require("../model/StateSchema");
const { ...combinedObj } = require("../helper/utils");

//-------------------------------------------
/**
 * Get One State by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<State>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return State.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------
/**
 * Get One State by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<State>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return State.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------
/**
 * Create State
 * @param {object} bodyData
 * @returns {Promise<State>}
 */
const createNewData = async (bodyData) => {
  return State.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id State
 * @param {ObjectId} id
 * @returns {Promise<State>}
 */
const getById = async (id) => {
  return State.findById(id);
};
//-------------------------------------------
/**
 * Update State by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<State>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return State.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true });
};
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<State>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return State.findOneAndUpdate(
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
 * @returns {Promise<State>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return State.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<State>}
 */
const getByIdAndDelete = async (id) => {
  return State.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<State>}
 */
const getOneAndDelete = async (matchObj) => {
  return State.findOneAndUpdate(
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
 * @returns {Promise<State>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return State.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<State>}
 */
const findAll = async () => {
  return State.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<State>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return State.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<State>}
 */
const createMany = async (insertDataArray) => {
  return State.insertMany(insertDataArray);
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
  return State.find({ ...matchObj, isDeleted: false }).count();
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
