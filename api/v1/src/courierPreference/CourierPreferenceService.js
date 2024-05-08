const CourierPreference = require("./CourierPreferenceSchema");
const { combineObjects } = require("../../helper/utils");

const getOneBySingleField = async (fieldName, fieldValue) => {
  return CourierPreference.findOne({
    [fieldName]: fieldValue,
    isDeleted: false,
  });
};
//-------------------------------------------

const getOneByMultiField = async (matchObj, projectObj) => {
  return CourierPreference.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

//-------------------------------------------

const createNewData = async (bodyData) => {
  return CourierPreference.create({ ...bodyData });
};
//-------------------------------------------

const getById = async (id) => {
  return CourierPreference.findById(id);
};
//-------------------------------------------

const getByIdAndUpdate = async (id, updateBody) => {
  return CourierPreference.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const getOneAndUpdate = async (matchObj, updateBody) => {
  return CourierPreference.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const onlyUpdateOne = async (matchObj, updateBody) => {
  return CourierPreference.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const getByIdAndDelete = async (id) => {
  return CourierPreference.findByIdAndDelete(id);
};
//-------------------------------------------

const getOneAndDelete = async (matchObj) => {
  return CourierPreference.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  );
};
//-------------------------------------------

const findAllWithQuery = async (matchObj, projectObj) => {
  return CourierPreference.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------

const findAll = async () => {
  return CourierPreference.find();
};
//-------------------------------------------

const aggregateQuery = async (aggregateQueryArray) => {
  return CourierPreference.aggregate(aggregateQueryArray);
};
//-------------------------------------------

const createMany = async (insertDataArray) => {
  return CourierPreference.insertMany(insertDataArray);
};
//-------------------------------------------

const findCount = async (matchObj) => {
  return CourierPreference.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------

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
