const Inventories = require("./InventoriesSchema");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One Inventories by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Inventories>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Inventories.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------
/**
 * Get One Inventories by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Inventories>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Inventories.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

//-------------------------------------------
/**
 * Create Inventories
 * @param {object} bodyData
 * @returns {Promise<Inventories>}
 */
const createNewData = async (bodyData) => {
  return Inventories.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id Inventories
 * @param {ObjectId} id
 * @returns {Promise<Inventories>}
 */
const getById = async (id) => {
  return Inventories.findById(id);
};
//-------------------------------------------
/**
 * Update Inventories by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Inventories>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Inventories.findByIdAndUpdate(
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
 * @returns {Promise<Inventories>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Inventories.findOneAndUpdate(
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
 * @returns {Promise<Inventories>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Inventories.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Inventories>}
 */
const getByIdAndDelete = async (id) => {
  return Inventories.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Inventories>}
 */
const getOneAndDelete = async (matchObj) => {
  return Inventories.findOneAndUpdate(
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
 * @returns {Promise<Inventories>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Inventories.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Inventories>}
 */
const findAll = async () => {
  return Inventories.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Inventories>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return Inventories.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Inventories>}
 */
const createMany = async (insertDataArray) => {
  return Inventories.insertMany(insertDataArray);
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<Inventories>}
 */
const findCount = async (matchObj) => {
  return Inventories.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<Inventories>}
 */
const isExists = async (filterArray, exceptIds = false, combined = false) => {
  if (combined) {
    let combinedObj = await combineObjects(filterArray);

    if (exceptIds) {
      combinedObj["_id"] = { $nin: exceptIds };
    }

    if (await getOneByMultiField({ ...combinedObj })) {
      return {
        exists: true,
        existsSummary: `${Object.keys(combinedObj)} already exist.`,
      };
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
