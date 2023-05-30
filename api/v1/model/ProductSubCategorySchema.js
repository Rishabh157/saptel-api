const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ProductSubCategorySchema = new mongoose.Schema(
  {
    subCategoryCode: {
      type: String,
      required: true,
      trim: true,
    },
    subCategoryName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    parentCategoryId: {
      type: ObjectId,
      required: true,
      trim: true,
    },

    hsnCode: {
      type: String,
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

const searchKeys = [
  "subCategoryCode",
  "subCategoryName",
  "parentCategoryId",
  "hsnCode",
  "companyId",
];
module.exports = mongoose.model("ProductSubCategory", ProductSubCategorySchema);
module.exports.searchKeys = [...searchKeys];
