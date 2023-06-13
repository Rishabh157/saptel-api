const mongoose = require("mongoose");
const FeatureSchema = new mongoose.Schema(
  {
    featureName: { type: String, required: true, trim: true, lowercase: true },
    moduleName: { type: String, required: true, trim: true, lowercase: true },
    featureRank: { type: Number, required: true, trim: true },
    moduleRank: { type: Number, required: true, trim: true },
    accessModules: {
      type: [],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const searchKeys = [
  "featureName",
  "moduleName",
  "featureRank",
  "moduleRank",
  "accessModule",
];
module.exports = mongoose.model("Feature", FeatureSchema);
module.exports.searchKeys = [...searchKeys];
