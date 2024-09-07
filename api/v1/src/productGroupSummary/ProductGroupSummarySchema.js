const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ProductGroupSummarySchema = new mongoose.Schema(
  {
    companyId: { type: ObjectId, required: true, trim: true },
    warehouseId: { type: ObjectId, required: true, trim: true },
    productGroupId: { type: ObjectId, required: true, trim: true },
    freezeQuantity: { type: Number, required: true, trim: true },
    avaliableQuantity: { type: Number, required: true, trim: true },
    avaliableUsedQuantity: { type: Number, default: 0, trim: true },
    damageQuantity: { type: Number, default: 0, trim: true },
    fakeQuantity: { type: Number, default: 0, trim: true },
    lostQuantity: { type: Number, default: 0, trim: true },
    destroyedQuantity: { type: Number, default: 0, trim: true },
    missingQuantity: { type: Number, default: 0, trim: true },
    closedQuantity: { type: Number, default: 0, trim: true },
    expiredQuantity: { type: Number, default: 0, trim: true },
    rtvQuantity: { type: Number, default: 0, trim: true },

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
