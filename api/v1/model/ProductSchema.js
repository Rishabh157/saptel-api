const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    productCode: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true, lowercase: true },
    productCategory: {
      type: String,
      required: true,
      trim: true,
    },
    productSubCategory: {
      type: String,
      required: true,
      trim: true,
    },
    productGroup: { type: String, required: true, trim: true },
    productWeight: { type: Number, required: true },
    dimension: {
      type: {
        height: {
          type: Number,
          required: true,
        },

        weight: {
          type: Number,
          required: true,
        },

        depth: {
          type: Number,
          required: true,
        },
      },

      required: true,
    },
    description: { type: String, required: true, trim: true, lowercase: true },
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
  "productCode",
  "productName",
  "productCategory",
  "productSubCategory",
  "productGroup",
  "productWeight",
  "dimension",
  "description",
];
const allFields = Object.keys(ProductSchema.obj);
module.exports = mongoose.model("Product", ProductSchema);
module.exports.searchKeys = [...searchKeys];
module.exports.allFields = [...allFields];
