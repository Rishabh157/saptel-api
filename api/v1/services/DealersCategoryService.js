const DealersCategory = require("../model/DealersCategorySchema");
const { combineObjects } = require("../helper/utils");

//-------------------------------------------
/**
 * Get One DealersCategory by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<DealersCategory>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return DealersCategory.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------
/**
 * Get One DealersCategory by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<DealersCategory>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return DealersCategory.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

//-------------------------------------------
/**
 * Create DealersCategory
 * @param {object} bodyData
 * @returns {Promise<DealersCategory>}
 */
const createNewData = async (bodyData) => {
  return DealersCategory.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id DealersCategory
 * @param {ObjectId} id
 * @returns {Promise<DealersCategory>}
 */
const getById = async (id) => {
  return DealersCategory.findById(id);
};
//-------------------------------------------
/**
 * Update DealersCategory by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<DealersCategory>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return DealersCategory.findByIdAndUpdate(
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
 * @returns {Promise<DealersCategory>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return DealersCategory.findOneAndUpdate(
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
 * @returns {Promise<DealersCategory>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return DealersCategory.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<DealersCategory>}
 */
const getByIdAndDelete = async (id) => {
  return DealersCategory.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<DealersCategory>}
 */
const getOneAndDelete = async (matchObj) => {
  return DealersCategory.findOneAndUpdate(
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
 * @returns {Promise<DealersCategory>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return DealersCategory.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<DealersCategory>}
 */
const findAll = async () => {
  return DealersCategory.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<DealersCategory>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return DealersCategory.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<DealersCategory>}
 */
const createMany = async (insertDataArray) => {
  return DealersCategory.insertMany(insertDataArray);
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
  return DealersCategory.find({ ...matchObj, isDeleted: false }).count();
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
