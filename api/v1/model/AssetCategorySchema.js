const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const AssetCategorySchema = new mongoose.Schema(
  {
    assetCategoryName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    companyId: { type: ObjectId, required: true, trim: true },
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

const searchKeys = ["assetCategoryName", "companyId"];
module.exports = mongoose.model("AssetCategory", AssetCategorySchema);
module.exports.searchKeys = [...searchKeys];
