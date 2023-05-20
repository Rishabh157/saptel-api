const Artist = require("../model/ArtistSchema");
const { combineObjects } = require("../helper/utils");

// ================createNewData==========
const createNewData = async (bodyData) => {
  return Artist.create({ ...bodyData });
};
//-------------------------------------------

// ================getOneAndUpdate================
const getOneAndUpdate = async (matchObj, updateBody) => {
  return Artist.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

// ================getById================
const getById = async (id) => {
  return Artist.findById(id);
};
//-------------------------------------------

// ================findAllWithQuery================
const findAllWithQuery = async (matchObj, projectObj) => {
  return Artist.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};
//-------------------------------------------

// ================getOneByMultiField================
const getOneByMultiField = async (matchObj, projectObj) => {
  return Artist.findOne({ ...matchObj, isDeleted: false }, { ...projectObj });
};
//-------------------------------------------

// ================aggregateQuery===============
const aggregateQuery = async (aggregateQueryArray) => {
  return Artist.aggregate(aggregateQueryArray);
};
//-------------------------------------------

// ================getOneAndDelete===============
const getOneAndDelete = async (matchObj) => {
  return Artist.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  );
};
//-------------------------------------------
const findCount = async (matchObj) => {
  return Artist.find({ ...matchObj, isDeleted: false }).count();
};
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
  createNewData,
  isExists,
  getOneByMultiField,
  getOneAndUpdate,
  findAllWithQuery,
  aggregateQuery,
  getOneAndDelete,
  getById,
  findCount,
};
