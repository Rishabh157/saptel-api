const ChannelUpdation = require("./ChannelUpdationSchema");
const mongoose = require("mongoose");
const { combineObjects } = require("../../helper/utils");

// ============createNewData=============
const createNewData = async (bodyData) => {
  return ChannelUpdation.create({ ...bodyData });
};
//-------------------------------------------

// ============getOneByMultiField=============
const getOneByMultiField = async (matchObj, projectObj) => {
  return ChannelUpdation.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
// --------------------------------------

//====================update DispositionTwo================
const getOneAndUpdate = async (matchObj, updateBody) => {
  return ChannelUpdation.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
// --------------------------------------

//====================getOneAndDelete================
const getOneAndDelete = async (matchObj) => {
  return ChannelUpdation.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  );
};
//-------------------------------------------

//====================findAllWithQuery================
const findAllWithQuery = async (matchObj, projectObj) => {
  return ChannelUpdation.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
// --------------------------------------

//====================aggregateQuery================
const aggregateQuery = async (aggregateQueryArray) => {
  return ChannelUpdation.aggregate(aggregateQueryArray);
};
// --------------------------------------

//====================findCount================
const findCount = async (matchObj) => {
  return ChannelUpdation.find({ ...matchObj, isDeleted: false }).count();
};
//-------------------------------------------

// ============isExists=============
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
  isExists,
  createNewData,
  getOneByMultiField,
  getOneAndUpdate,
  getOneAndDelete,
  findAllWithQuery,
  aggregateQuery,
  findCount,
};
