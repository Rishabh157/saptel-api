const mongoose = require("mongoose");

exports.collectionNameArray = async (moduleName) => {
  // Retrieve a list of all the collection names

  let collections = await mongoose.modelNames();

  if (!collections.includes(moduleName)) {
    return {
      status: false,
      message: "Module does not exist in data base collection.",
      data: [],
    };
  }

  // Retrieving the field names from the model schema

  let allFields = Object.keys(mongoose.model(moduleName).schema.paths);
  return allFields;
};
