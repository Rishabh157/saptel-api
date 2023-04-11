const PurchaseOrder = require("../model/PurchaseOrderSchema");
const { combineObjects } = require("../helper/utils");

//-------------------------------------------
/**
 * Get One PurchaseOrder by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<PurchaseOrder>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return PurchaseOrder.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------
/**
 * Get One PurchaseOrder by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<PurchaseOrder>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return PurchaseOrder.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

//-------------------------------------------
/**
 * Create PurchaseOrder
 * @param {object} bodyData
 * @returns {Promise<PurchaseOrder>}
 */
const createNewData = async (bodyData) => {
  return PurchaseOrder.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id PurchaseOrder
 * @param {ObjectId} id
 * @returns {Promise<PurchaseOrder>}
 */
const getById = async (id) => {
  return PurchaseOrder.findById(id);
};
//-------------------------------------------
/**
 * Update PurchaseOrder by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<PurchaseOrder>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return PurchaseOrder.findByIdAndUpdate(
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
 * @returns {Promise<PurchaseOrder>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return PurchaseOrder.findOneAndUpdate(
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
 * @returns {Promise<PurchaseOrder>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return PurchaseOrder.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<PurchaseOrder>}
 */
const getByIdAndDelete = async (id) => {
  return PurchaseOrder.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<PurchaseOrder>}
 */
const getOneAndDelete = async (matchObj) => {
  return PurchaseOrder.findOneAndUpdate(
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
 * @returns {Promise<PurchaseOrder>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return PurchaseOrder.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<PurchaseOrder>}
 */
const findAll = async () => {
  return PurchaseOrder.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<PurchaseOrder>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return PurchaseOrder.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<PurchaseOrder>}
 */
const createMany = async (insertDataArray) => {
  return PurchaseOrder.insertMany(insertDataArray);
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<PurchaseOrder>}
 */
const findCount = async (matchObj) => {
  return PurchaseOrder.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<PurchaseOrder>}
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
