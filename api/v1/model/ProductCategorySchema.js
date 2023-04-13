const mongoose = require("mongoose");
const ProductCategorySchema = new mongoose.Schema(
  {
    categoryCode: { type: String, required: true, trim: true, lowercase: true },
    categoryName: { type: String, required: true, trim: true, lowercase: true },
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
const allFields = Object.keys(ProductCategorySchema.obj);
const searchKeys = ["categoryCode", "categoryName"];
module.exports = mongoose.model("ProductCategory", ProductCategorySchema);
module.exports.searchKeys = [...searchKeys];
module.exports.allFields = [...allFields];
