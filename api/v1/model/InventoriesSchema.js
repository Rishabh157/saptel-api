const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const InventoriesSchema = new mongoose.Schema(
  {
    productGroupName: { type: String, required: true, trim: true },
    groupBarcodeNumber: { type: String, required: true },
    barcodeNumber: { type: String, required: true },
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
