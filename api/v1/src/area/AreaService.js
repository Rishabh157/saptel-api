const Area = require("./AreaSchema");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One Area by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Area>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Area.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------
/**
 * Get One Area by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Area>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Area.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------
/**
 * Create Area
 * @param {object} bodyData
 * @returns {Promise<Area>}
 */
const createNewData = async (bodyData) => {
  return Area.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id Area
 * @param {ObjectId} id
 * @returns {Promise<Area>}
 */
const getById = async (id) => {
  return Area.findById(id);
};
//-------------------------------------------
/**
 * Update Area by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Area>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Area.findByIdAndUpdate({ _id: id }, { ...updateBody }, { new: true });
};
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Area>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Area.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};

const updateMany = async (matchObj, updateBody) => {
  return Area.updateMany({ ...matchObj }, { ...updateBody }, { new: true });
};
//-------------------------------------------
/**
 * find One and update
 * @param {object} matchObj
 * @param {Object} updateBody
 * @returns {Promise<Area>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Area.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise <Area>}
 */
const getByIdAndDelete = async (id) => {
  return Area.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise <Area>}
 */
const getOneAndDelete = async (matchObj) => {
  return Area.findOneAndUpdate(
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
 * @returns {Promise <Area> }
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Area.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise <Area>}
 */
const findAll = async () => {
  return Area.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise <Area>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return Area.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise <Area> }
 */
const createMany = async (insertDataArray) => {
  return Area.insertMany(insertDataArray);
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <Area>}
 */
const findCount = async (matchObj) => {
  return Area.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <Area>}
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
  updateMany,
};
