const mongoose = require("mongoose");
exports.isAllFieldsExists = (allFields, fields) => {
  const filteredArray = allFields.data.filter(
    (item) =>
      item !== "isDeleted" &&
      item !== "isActive" &&
      item !== "createdAt" &&
      item !== "updatedAt" &&
      item !== "_id" &&
      item !== "__v"
  );

  return filteredArray.reduce(
    (acc, field) => {
      let fieldExists = fields.find((e) => {
        return e.fieldName === field;
      });
      if (!fieldExists) {
        acc.status = false;
        acc.message += `${field} is missing in fields array. `;
      }
      return acc;
    },
    { status: true, message: "" }
  );
};
exports.collectionNameArray = async (actionName) => {
  // Retrieve a list of all the collection names

  let collections = await mongoose.modelNames();

  if (!collections.includes(actionName)) {
    return {
      status: false,
      message: "Module does not exist in data base collection.",
      data: [],
    };
  }

  // Retrieving the field names from the model schema

  let allFields = Object.keys(mongoose.model(actionName).schema.paths);
  return {
    status: true,
    message: "success",
    data: allFields,
  };
};
