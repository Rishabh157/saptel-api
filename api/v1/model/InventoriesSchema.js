const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { inventoryStatus, inventoryCondition } = require("../helper/enumUtils");
const InventoriesSchema = new mongoose.Schema(
  {
    productGroupName: { type: String, required: true, trim: true },
    groupBarcodeNumber: { type: String, required: true },
    barcodeNumber: { type: String, required: true },
    wareHouse: { type: ObjectId, required: true },
    expiryDate: { type: String, required: false, trim: true },
    quantity: { type: Number, default: 1 },

    status: {
      type: String,
      enum: [inventoryStatus.available, inventoryStatus.outOfStock],
      trim: true,
      default: inventoryStatus.available,
    },
    condition: {
      type: String,
      enum: [inventoryCondition.good, inventoryCondition.defective],
      trim: true,
      default: inventoryCondition.good,
    },
    companyId: { type: ObjectId, required: true },
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

const searchKeys = ["productGroupName", "groupBarcode"];
module.exports = mongoose.model("Inventories", InventoriesSchema);
module.exports.searchKeys = [...searchKeys];
