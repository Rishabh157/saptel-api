const ZonalManagerSchema = require("./ZonalManagerSchema");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One ZonalManagerSchema by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<ZonalManagerSchema>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return ZonalManagerSchema.findOne({
    [fieldName]: fieldValue,
    isDeleted: false,
  });
};
//-------------------------------------------
/**
 * Get One ZonalManagerSchema by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<ZonalManagerSchema>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return ZonalManagerSchema.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

//-------------------------------------------
/**
 * Create ZonalManagerSchema
 * @param {object} bodyData
 * @returns {Promise<ZonalManagerSchema>}
 */
const createNewData = async (bodyData) => {
  return ZonalManagerSchema.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id ZonalManagerSchema
 * @param {ObjectId} id
 * @returns {Promise<ZonalManagerSchema>}
 */
const getById = async (id) => {
  return ZonalManagerSchema.findById(id);
};
//-------------------------------------------
/**
 * Update ZonalManagerSchema by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<ZonalManagerSchema>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return ZonalManagerSchema.findByIdAndUpdate(
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
 * @returns {Promise<ZonalManagerSchema>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return ZonalManagerSchema.findOneAndUpdate(
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
 * @returns {Promise<ZonalManagerSchema>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return ZonalManagerSchema.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<ZonalManagerSchema>}
 */
const getByIdAndDelete = async (id) => {
  return ZonalManagerSchema.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<ZonalManagerSchema>}
 */
const getOneAndDelete = async (matchObj) => {
  return ZonalManagerSchema.findOneAndUpdate(
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
 * @returns {Promise<ZonalManagerSchema>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return ZonalManagerSchema.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<ZonalManagerSchema>}
 */
const findAll = async () => {
  return ZonalManagerSchema.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<ZonalManagerSchema>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return ZonalManagerSchema.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<ZonalManagerSchema>}
 */
const createMany = async (insertDataArray) => {
  return ZonalManagerSchema.insertMany(insertDataArray);
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise <ZonalManagerSchema> }
 */
const findCount = async (matchObj) => {
  return ZonalManagerSchema.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <ZonalManagerSchema> }
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
