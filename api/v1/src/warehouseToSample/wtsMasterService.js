const WtsMaster = require("./wtsMasterSchema");
const { combineObjects } = require("../../helper/utils");

const getOneBySingleField = async (fieldName, fieldValue) => {
  return WtsMaster.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------

const getOneByMultiField = async (matchObj, projectObj) => {
  return WtsMaster.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

const updateMany = async (matchObj, updateBody) => {
  return WtsMaster.updateMany(
    { ...matchObj },
    { ...updateBody },
    { new: true }
  );
};

//-------------------------------------------

const createNewData = async (bodyData) => {
  return WtsMaster.create({ ...bodyData });
};
//-------------------------------------------

const getById = async (id) => {
  return WtsMaster.findById(id);
};
//-------------------------------------------

const getByIdAndUpdate = async (id, updateBody) => {
  return WtsMaster.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const getOneAndUpdate = async (matchObj, updateBody) => {
  return WtsMaster.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const onlyUpdateOne = async (matchObj, updateBody) => {
  return WtsMaster.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const getByIdAndDelete = async (id) => {
  return WtsMaster.findByIdAndDelete(id);
};
//-------------------------------------------

const getOneAndDelete = async (matchObj) => {
  return WtsMaster.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  );
};
//-------------------------------------------

const findAllWithQuery = async (matchObj, projectObj) => {
  return WtsMaster.find({ ...matchObj, isDeleted: false }, { ...projectObj });
};
//-------------------------------------------

const findAll = async () => {
  return WtsMaster.find();
};
//-------------------------------------------

const aggregateQuery = async (aggregateQueryArray) => {
  return WtsMaster.aggregate(aggregateQueryArray);
};
//-------------------------------------------

const createMany = async (insertDataArray) => {
  return WtsMaster.insertMany(insertDataArray);
};
//-------------------------------------------

const findCount = async (matchObj) => {
  return WtsMaster.find({ ...matchObj, isDeleted: false }).count();
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