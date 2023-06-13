const DispositionTwo = require("./DispositionTwoSchema");
const mongoose = require("mongoose");
const { combineObjects } = require("../../helper/utils");

//====================getOneByMultiField  DispositionTwo================
const getOneByMultiField = async (matchObj, projectObj) => {
  return DispositionTwo.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
// --------------------------------------

//====================create new DispositionTwo================
const createNewData = async (bodyData) => {
  return DispositionTwo.create({ ...bodyData });
};
// --------------------------------------

//====================create new DispositionTwo================
const getOneAndUpdate = async (matchObj, updateBody) => {
  return DispositionTwo.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
// --------------------------------------

//====================getOneAndDelete================
const getOneAndDelete = async (matchObj) => {
  return DispositionTwo.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  );
};
//-------------------------------------------

//====================findAllWithQuery================
const findAllWithQuery = async (matchObj, projectObj) => {
  return DispositionTwo.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
// --------------------------------------

//==================== etById================
const getById = async (id) => {
  console.log(id);
  return DispositionTwo.find({
    dispositionOneId: new mongoose.Types.ObjectId(id),
    isDeleted: false,
  });
};
//-------------------------------------------

//====================aggregateQuery================
const aggregateQuery = async (aggregateQueryArray) => {
  return DispositionTwo.aggregate(aggregateQueryArray);
};
// --------------------------------------

//====================findCount================
const findCount = async (matchObj) => {
  return DispositionTwo.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------

//====================isExists================

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

module.exports = {
  createNewData,
  isExists,
  getOneByMultiField,
  getOneAndUpdate,
  findAllWithQuery,
  getById,
  aggregateQuery,
  getOneAndDelete,
  findCount,
};
