const DealerInventories = require("./DealerInventoriesSchema");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One DealerInventories by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<DealerInventories>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return DealerInventories.findOne({
    [fieldName]: fieldValue,
    isDeleted: false,
  });
};
//-------------------------------------------
/**
 * Get One DealerInventories by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<DealerInventories>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return DealerInventories.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

//-------------------------------------------
/**
 * Create DealerInventories
 * @param {object} bodyData
 * @returns {Promise<DealerInventories>}
 */
const createNewData = async (bodyData) => {
  return DealerInventories.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id DealerInventories
 * @param {ObjectId} id
 * @returns {Promise<DealerInventories>}
 */
const getById = async (id) => {
  return DealerInventories.findById(id);
};
//-------------------------------------------
/**
 * Update DealerInventories by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<DealerInventories>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return DealerInventories.findByIdAndUpdate(
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
 * @returns {Promise<DealerInventories>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return DealerInventories.findOneAndUpdate(
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
 * @returns {Promise<DealerInventories>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return DealerInventories.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<DealerInventories>}
 */
const getByIdAndDelete = async (id) => {
  return DealerInventories.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<DealerInventories>}
 */
const getOneAndDelete = async (matchObj) => {
  return DealerInventories.findOneAndUpdate(
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
 * @returns {Promise<DealerInventories>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return DealerInventories.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<DealerInventories>}
 */
const findAll = async () => {
  return DealerInventories.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<DealerInventories>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return DealerInventories.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<DealerInventories>}
 */
const createMany = async (insertDataArray) => {
  return DealerInventories.insertMany(insertDataArray);
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<DealerInventories>}
 */
const findCount = async (matchObj) => {
  return DealerInventories.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise<DealerInventories>}
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
