const WtwMaster = require("./wtwMasterSchema");
const { combineObjects } = require("../../helper/utils");

const getOneBySingleField = async (fieldName, fieldValue) => {
  return WtwMaster.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------

const getOneByMultiField = async (matchObj, projectObj) => {
  return WtwMaster.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

const updateMany = async (matchObj, updateBody) => {
  return WtwMaster.updateMany(
    { ...matchObj },
    { ...updateBody },
    { new: true }
  );
};

//-------------------------------------------

const createNewData = async (bodyData) => {
  return WtwMaster.create({ ...bodyData });
};
//-------------------------------------------

const getById = async (id) => {
  return WtwMaster.findById(id);
};
//-------------------------------------------

const getByIdAndUpdate = async (id, updateBody) => {
  return WtwMaster.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const getOneAndUpdate = async (matchObj, updateBody) => {
  return WtwMaster.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const onlyUpdateOne = async (matchObj, updateBody) => {
  return WtwMaster.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const getByIdAndDelete = async (id) => {
  return WtwMaster.findByIdAndDelete(id);
};
//-------------------------------------------

const getOneAndDelete = async (matchObj) => {
  return WtwMaster.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  );
};
//-------------------------------------------

const findAllWithQuery = async (matchObj, projectObj) => {
  return WtwMaster.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};
//-------------------------------------------

const findAll = async () => {
  return WtwMaster.find();
};
//-------------------------------------------

const aggregateQuery = async (aggregateQueryArray) => {
  return WtwMaster.aggregate(aggregateQueryArray);
};
//-------------------------------------------

const createMany = async (insertDataArray) => {
  return WtwMaster.insertMany(insertDataArray);
};
//-------------------------------------------

const findCount = async (matchObj) => {
  return WtwMaster.find({ ...matchObj, isDeleted: false }).count();
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
  updateMany,
};
