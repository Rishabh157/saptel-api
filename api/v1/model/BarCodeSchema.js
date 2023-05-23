const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const BarCodeSchema = new mongoose.Schema(
  {
    productGroup: { type: ObjectId, required: true, trim: true },
    barcodeNumber: { type: String, required: true, trim: true },
    barcodeGroupNumber: { type: String, required: true, trim: true },
    isUsed: { type: Boolean, default: false },
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
  "productGroup",
  "barcodeNumber",
  "productGroupLabel",
  "barcodeGroupNumber",
];
module.exports = mongoose.model("BarCode", BarCodeSchema);
module.exports.searchKeys = [...searchKeys];
