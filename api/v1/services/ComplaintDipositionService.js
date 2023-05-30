const ComplaintDisposition = require("../model/ComplaintDispositionSchema");
const { combineObjects } = require("../helper/utils");

// ================getOneByMultiField================
const getOneByMultiField = async (matchObj, projectObj) => {
  return ComplaintDisposition.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------

// ================getOneBySingleField================

const getOneBySingleField = async (fieldName, fieldValue) => {
  return ComplaintDisposition.findOne({
    [fieldName]: fieldValue,
    isDeleted: false,
  });
};
//-------------------------------------------

// ================findCount================

const findCount = async (matchObj) => {
  return ComplaintDisposition.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------

// ================getOneAndUpdate================
const getOneAndUpdate = async (matchObj, updateBody) => {
  return ComplaintDisposition.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

// ================getById================
const getById = async (id) => {
  return ComplaintDisposition.findById(id);
};
//-------------------------------------------

// ================findAllWithQuery================
const findAllWithQuery = async (matchObj, projectObj) => {
  return ComplaintDisposition.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------

// ================getOneAndDelete===============
const getOneAndDelete = async (matchObj) => {
  return ComplaintDisposition.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  );
};
//-------------------------------------------

// ================aggregateQuery===============
const aggregateQuery = async (aggregateQueryArray) => {
  return ComplaintDisposition.aggregate(aggregateQueryArray);
};
//-------------------------------------------

//====================createNewData================
const createNewData = async (bodyData) => {
  return ComplaintDisposition.create({ ...bodyData });
};
// --------------------------------------

// ================getByIdAndUpdate================
const getByIdAndUpdate = async (id, updateBody) => {
  return ComplaintDisposition.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

// ================onlyUpdateOne================
const onlyUpdateOne = async (matchObj, updateBody) => {
  return ComplaintDisposition.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

// ================getByIdAndDelete================
const getByIdAndDelete = async (id) => {
  return ComplaintDisposition.findByIdAndDelete(id);
};
//-------------------------------------------

// ================findAll================
const findAll = async () => {
  return ComplaintDisposition.find();
};
//-------------------------------------------

// ================createMany================
const createMany = async (insertDataArray) => {
  return ComplaintDisposition.insertMany(insertDataArray);
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
// ----------------------------------

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
