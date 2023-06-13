const Feature = require("./FeatureSchema");
const { combineObjects } = require("../helper/utils");

//-------------------------------------------
/**
 * Get One Feature by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<Feature>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return Feature.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------
/**
 * Get One Feature by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<Feature>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return Feature.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};

//-------------------------------------------
/**
 * Create Feature
 * @param {object} bodyData
 * @returns {Promise<Feature>}
 */
const createNewData = async (bodyData) => {
  return Feature.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id Feature
 * @param {ObjectId} id
 * @returns {Promise<Feature>}
 */
const getById = async (id) => {
  return Feature.findById(id);
};
//-------------------------------------------
/**
 * Update Feature by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<Feature>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return Feature.findByIdAndUpdate(
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
 * @returns {Promise<Feature>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Feature.findOneAndUpdate(
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
 * @returns {Promise<Feature>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return Feature.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<Feature>}
 */
const getByIdAndDelete = async (id) => {
  return Feature.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<Feature>}
 */
const getOneAndDelete = async (matchObj) => {
  return Feature.findOneAndUpdate(
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
 * @returns {Promise<Feature>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return Feature.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<Feature>}
 */
const findAll = async () => {
  return Feature.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<Feature>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return Feature.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<Feature>}
 */
const createMany = async (insertDataArray) => {
  return Feature.insertMany(insertDataArray);
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
  return Feature.find({ ...matchObj, isDeleted: false }).count();
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
