const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const AssetSchema = mongoose.Schema(
  {
    assetName: {
      type: String,
      required: true,
      trim: true,
    },
    assetCategoryId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
      trim: true,
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
const searchKeys = ["assetCategoryId", "companyId", "assetName"];
module.exports = mongoose.model("Asset", AssetSchema);
module.exports.searchKeys = [...searchKeys];