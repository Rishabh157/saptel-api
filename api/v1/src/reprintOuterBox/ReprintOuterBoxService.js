const ReprintOuterBox = require("./ReprintOuterBoxSchema");
const { combineObjects } = require("../../helper/utils");

const getOneBySingleField = async (fieldName, fieldValue) => {
  return ReprintOuterBox.findOne({ [fieldName]: fieldValue, isDeleted: false });
};
//-------------------------------------------

const getOneByMultiField = async (matchObj, projectObj) => {
  return ReprintOuterBox.findOne(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};

//-------------------------------------------

const createNewData = async (bodyData) => {
  return ReprintOuterBox.create({ ...bodyData });
};
//-------------------------------------------

const getById = async (id) => {
  return ReprintOuterBox.findById(id);
};
//-------------------------------------------

const getByIdAndUpdate = async (id, updateBody) => {
  return ReprintOuterBox.findByIdAndUpdate(
    { _id: id },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const getOneAndUpdate = async (matchObj, updateBody) => {
  return ReprintOuterBox.findOneAndUpdate(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const onlyUpdateOne = async (matchObj, updateBody) => {
  return ReprintOuterBox.updateOne(
    { ...matchObj, isDeleted: false },
    { ...updateBody },
    { new: true }
  );
};
//-------------------------------------------

const getByIdAndDelete = async (id) => {
  return ReprintOuterBox.findByIdAndDelete(id);
};
//-------------------------------------------

const getOneAndDelete = async (matchObj) => {
  return ReprintOuterBox.findOneAndUpdate(
    { ...matchObj },
    { isDeleted: true },
    { new: true }
  );
};
//-------------------------------------------

const findAllWithQuery = async (matchObj, projectObj) => {
  return ReprintOuterBox.find(
    { ...matchObj, isDeleted: false },
    { ...projectObj }
  );
};
//-------------------------------------------

const findAll = async () => {
  return ReprintOuterBox.find();
};
//-------------------------------------------

const aggregateQuery = async (aggregateQueryArray) => {
  return ReprintOuterBox.aggregate(aggregateQueryArray);
};
//-------------------------------------------

const createMany = async (insertDataArray) => {
  return ReprintOuterBox.insertMany(insertDataArray);
};
//-------------------------------------------

const findCount = async (matchObj) => {
  return ReprintOuterBox.find({ ...matchObj, isDeleted: false }).count();
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
