const IntialCallTwo = require("../model/InitialCallTwoSchema");
const { combineObjects } = require("../helper/utils");

// ================getOneBySingleField================
const getOneBySingleField = async (fieldName, fieldValue) => {
  return IntialCallTwo.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------

// ================getOneByMultiField================
const getOneByMultiField = async (matchObj, projectObj) => {
  return IntialCallTwo.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------

//====================createNewData================
const createNewData = async (bodyData) => {
  return IntialCallTwo.create({ ...bodyData });
};
//-------------------------------------------

// ================getById================
const getById = async (id) => {
  return IntialCallTwo.findById(id);
};
//-------------------------------------------

// ================getByIdAndUpdate================
const getByIdAndUpdate = async (id, updateBody) => {
  return IntialCallTwo.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const getOneAndUpdate = async (matchObj, updateBody) => {
  return IntialCallTwo.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

// ================onlyUpdateOne================
const onlyUpdateOne = async (matchObj, updateBody) => {
  return IntialCallTwo.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

// ================getByIdAndDelete================
const getByIdAndDelete = async (id) => {
  return IntialCallTwo.findByIdAndDelete(id);
};
//-------------------------------------------

// ================getOneAndDelete===============
const getOneAndDelete = async (matchObj) => {
  return IntialCallTwo.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  );
};
//-------------------------------------------

// ================findAllWithQuery================
const findAllWithQuery = async (matchObj, projectObj) => {
  return IntialCallTwo.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------

// ================findAll================
const findAll = async () => {
  return IntialCallTwo.find();
};
//-------------------------------------------

// ================aggregateQuery===============
const aggregateQuery = async (aggregateQueryArray) => {
  return IntialCallTwo.aggregate(aggregateQueryArray);
};
//-------------------------------------------

// ================createMany================
const createMany = async (insertDataArray) => {
  return IntialCallTwo.insertMany(insertDataArray);
};
//-------------------------------------------

// ================findCount================
const findCount = async (matchObj) => {
  return IntialCallTwo.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------

// ================isExists===============
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
