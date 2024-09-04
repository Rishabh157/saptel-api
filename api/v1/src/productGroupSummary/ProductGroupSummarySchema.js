const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ProductGroupSummarySchema = new mongoose.Schema(
  {
    companyId: { type: ObjectId, required: true, trim: true },
    warehouseId: { type: ObjectId, required: true, trim: true },
    productGroupId: { type: ObjectId, required: true, trim: true },
    freezeQuantity: { type: Number, required: true, trim: true },
    avaliableQuantity: { type: Number, required: true, trim: true },
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

const searchKeys = ["productGroupLabel"];
module.exports = mongoose.model(
  "ProductGroupSummary",
  ProductGroupSummarySchema
);
module.exports.searchKeys = [...searchKeys];
