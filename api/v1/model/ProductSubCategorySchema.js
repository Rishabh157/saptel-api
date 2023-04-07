const mongoose = require("mongoose");
const ProductSubCategorySchema = new mongoose.Schema(
  {
    subCategoryCode: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subCategoryName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    parentCategory: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    applicableTaxes: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    hsnCode: { type: String, required: true, trim: true, lowercase: true },
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
  "parentCategory",
  "applicableTaxes",
  "hsnCode",
];
module.exports = mongoose.model("ProductSubCategory", ProductSubCategorySchema);
module.exports.searchKeys = [...searchKeys];
