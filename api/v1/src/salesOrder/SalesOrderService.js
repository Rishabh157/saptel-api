const SalesOrder = require("./SalesOrderSchema");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One SalesOrder by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<SalesOrder>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return SalesOrder.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------
/**
 * Get One SalesOrder by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<SalesOrder>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return SalesOrder.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

//-------------------------------------------
/**
 * Create SalesOrder
 * @param {object} bodyData
 * @returns {Promise<SalesOrder>}
 */
const createNewData = async (bodyData) => {
  return SalesOrder.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id SalesOrder
 * @param {ObjectId} id
 * @returns {Promise<SalesOrder>}
 */
const getById = async (id) => {
  return SalesOrder.findById(id);
};
//-------------------------------------------
/**
 * Update SalesOrder by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<SalesOrder>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return SalesOrder.findByIdAndUpdate(
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
 * @returns {Promise<SalesOrder>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return SalesOrder.findOneAndUpdate(
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
 * @returns {Promise<SalesOrder>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return SalesOrder.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<SalesOrder>}
 */
const getByIdAndDelete = async (id) => {
  return SalesOrder.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<SalesOrder>}
 */
const getOneAndDelete = async (matchObj) => {
  return SalesOrder.findOneAndUpdate(
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
 * @returns {Promise<SalesOrder>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return SalesOrder.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<SalesOrder>}
 */
const findAll = async () => {
  return SalesOrder.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<SalesOrder>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return SalesOrder.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<SalesOrder>}
 */
const createMany = async (insertDataArray) => {
  return SalesOrder.insertMany(insertDataArray);
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<SalesOrder>}
 */
const findCount = async (matchObj) => {
  return SalesOrder.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<SalesOrder>}
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
