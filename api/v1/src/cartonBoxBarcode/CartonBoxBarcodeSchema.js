const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const CartonBoxBarcodeSchema = new mongoose.Schema(
  {
    cartonBoxId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    barcodeNumber: {
      type: String,
      required: true,
      trim: true,
    },
    itemBarcodeNumber: {
      type: String,
      required: true,
      trim: true,
    },
    barcodeGroupNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
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
  "cartonBox",
  "barcodeNumber",
  "barcodeGroupNumber",
  "isUsed",
  "companyId",
  "cartonboxLabel",
];
module.exports = mongoose.model("CartonBoxBarcode", CartonBoxBarcodeSchema);
module.exports.searchKeys = [...searchKeys];
