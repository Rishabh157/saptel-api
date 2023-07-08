const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const BarCodeSchema = new mongoose.Schema(
  {
    productGroupId: { type: ObjectId, required: true, trim: true },
    barcodeNumber: { type: String, required: true, trim: true },
    barcodeGroupNumber: { type: String, required: true, trim: true },
    lotNumber: { type: String, required: true, trim: true },
    isUsed: { type: Boolean, default: false },
    wareHouseId: { type: ObjectId, required: true, trim: true },

    companyId: { type: ObjectId, required: true, trim: true },

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
  "productGroupId",
  "barcodeNumber",
  "productGroupLabel",
  "barcodeGroupNumber",
  "lotNumber",
];
module.exports = mongoose.model("BarCode", BarCodeSchema);
module.exports.searchKeys = [...searchKeys];
