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
    parentCategory: {
      type: {
        label: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
      required: true,
    },
    applicableTaxes: {
      type: {
        label: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
      required: true,
    },
    hsnCode: { type: String, required: true, trim: true },
    companyId: { type: String, required: true, trim: true },
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
  "parentCategory.label",
  "applicableTaxes.label",
  "hsnCode",
];
module.exports = mongoose.model("ProductSubCategory", ProductSubCategorySchema);
module.exports.searchKeys = [...searchKeys];
