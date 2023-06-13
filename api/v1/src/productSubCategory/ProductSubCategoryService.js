const ProductSubCategory = require("./ProductSubCategorySchema");
const { combineObjects } = require("../../helper/utils");

//-------------------------------------------
/**
 * Get One ProductSubCategory by single field
 * @param {string} fieldName
 * @param {string} fieldValue
 * @returns {Promise<ProductSubCategory>}
 */
const getOneBySingleField = async (fieldName, fieldValue) => {
  return ProductSubCategory.findOne({
    [fieldName]: fieldValue,
    isDeleted: false,
  });
};
//-------------------------------------------
/**
 * Get One ProductSubCategory by multiple Fields field
 * @param {object} matchObj
 * @param {object} projectObj
 * @returns {Promise<ProductSubCategory>}
 */
const getOneByMultiField = async (matchObj, projectObj) => {
  return ProductSubCategory.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

//-------------------------------------------
/**
 * Create ProductSubCategory
 * @param {object} bodyData
 * @returns {Promise<ProductSubCategory>}
 */
const createNewData = async (bodyData) => {
  return ProductSubCategory.create({ ...bodyData });
};
//-------------------------------------------
/**
 * get by id ProductSubCategory
 * @param {ObjectId} id
 * @returns {Promise<ProductSubCategory>}
 */
const getById = async (id) => {
  return ProductSubCategory.findById(id);
};
//-------------------------------------------
/**
 * Update ProductSubCategory by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<ProductSubCategory>}
 */
const getByIdAndUpdate = async (id, updateBody) => {
  return ProductSubCategory.findByIdAndUpdate(
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
 * @returns {Promise<ProductSubCategory>}
 */
const getOneAndUpdate = async (matchObj, updateBody) => {
  return ProductSubCategory.findOneAndUpdate(
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
 * @returns {Promise<ProductSubCategory>}
 */
const onlyUpdateOne = async (matchObj, updateBody) => {
  return ProductSubCategory.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------
/**
 * Delete by id
 * @param {ObjectId} id
 * @returns {Promise<ProductSubCategory>}
 */
const getByIdAndDelete = async (id) => {
  return ProductSubCategory.findByIdAndDelete(id);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {object} matchObj
 * @returns {Promise<ProductSubCategory>}
 */
const getOneAndDelete = async (matchObj) => {
  return ProductSubCategory.findOneAndUpdate(
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
 * @returns {Promise<ProductSubCategory>}
 */
const findAllWithQuery = async (matchObj, projectObj) => {
  return ProductSubCategory.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------
/**
 * find one and delete
 * @returns {Promise<ProductSubCategory>}
 */
const findAll = async () => {
  return ProductSubCategory.find();
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} aggregateQueryArray
 * @returns {Promise<ProductSubCategory>}
 */
const aggregateQuery = async (aggregateQueryArray) => {
  return ProductSubCategory.aggregate(aggregateQueryArray);
};
//-------------------------------------------
/**
 * find one and delete
 * @param {Array} insertDataArray
 * @returns {Promise<ProductSubCategory>}
 */
const createMany = async (insertDataArray) => {
  return ProductSubCategory.insertMany(insertDataArray);
};
//-------------------------------------------
/**
 * find Count and delete
 * @param {object} matchObj
 * @returns {Promise<ProductSubCategory>}
 */
const findCount = async (matchObj) => {
  return ProductSubCategory.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------
/**
 *
 * @param {Array} filterArray
 * @param {Array} exceptIds
 * @param {Boolean} combined
 * @returns {Promise <ProductSubCategory> }
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
