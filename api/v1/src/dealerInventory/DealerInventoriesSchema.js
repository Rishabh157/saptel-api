const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const {
  inventoryStatus,
  inventoryCondition,
} = require("../../helper/enumUtils");
const DealerInventoriesSchema = new mongoose.Schema(
  {
    productGroupName: {
      type: String,
      required: true,
      trim: true,
    },
    groupBarcodeNumber: {
      type: String,
      required: true,
    },
    barcodeNumber: {
      type: String,
      required: true,
    },
    wareHouseId: {
      type: ObjectId,
      required: true,
    },
    dealerId: {
      type: ObjectId,
      required: true,
    },
    expiryDate: {
      type: String,
      required: false,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
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
  "productGroupName",
  "wareHouseId",
  "companyId",
  "groupBarcode",
  "dealerId",
];
module.exports = mongoose.model("DealerInventory", DealerInventoriesSchema);
module.exports.searchKeys = [...searchKeys];
