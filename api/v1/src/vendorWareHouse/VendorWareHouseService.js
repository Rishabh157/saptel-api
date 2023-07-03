const VendorWareHouse = require("./VendorWareHouseSchema");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One WareHouse by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<WareHouse>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return VendorWareHouse.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------
/**
 * Get One WareHouse by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<WareHouse>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return VendorWareHouse.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

//-------------------------------------------
/**
 * Create WareHouse
 * @param {object} bodyData
 * @returns {Promise<WareHouse>}
 */
const createNewData = async (bodyData) => {
  return VendorWareHouse.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id WareHouse
 * @param {ObjectId} id
 * @returns {Promise<WareHouse>}
 */
const getById = async (id) => {
  return VendorWareHouse.findById(id);
};
//-------------------------------------------
/**
 * Update WareHouse by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<WareHouse>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return VendorWareHouse.findByIdAndUpdate(
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
 * @returns {Promise<WareHouse>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return VendorWareHouse.findOneAndUpdate(
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
 * @returns {Promise<WareHouse>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return VendorWareHouse.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<WareHouse>}
 */
const getByIdAndDelete = async (id) => {
  return VendorWareHouse.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<WareHouse>}
 */
const getOneAndDelete = async (matchObj) => {
  return VendorWareHouse.findOneAndUpdate(
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
 * @returns {Promise<WareHouse>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return VendorWareHouse.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<WareHouse>}
 */
const findAll = async () => {
  return VendorWareHouse.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<WareHouse>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return VendorWareHouse.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<WareHouse>}
 */
const createMany = async (insertDataArray) => {
  return VendorWareHouse.insertMany(insertDataArray);
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<WareHouse>}
 */
const findCount = async (matchObj) => {
  return VendorWareHouse.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<WareHouse>}
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
