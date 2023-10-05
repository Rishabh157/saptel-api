const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const BarCodeFlowSchema = new mongoose.Schema(
  {
    productGroupId: { type: ObjectId, required: true, trim: true },
    barcodeNumber: { type: String, required: true, trim: true },
    barcodeGroupNumber: { type: String, required: true, trim: true },
    lotNumber: { type: String, required: true, trim: true },
    isUsed: { type: Boolean, default: false },
    wareHouseId: { type: ObjectId, default: null, trim: true },
    dealerId: { type: ObjectId, default: null, trim: true },

    status: {
      type: String,
      enum: ["AT_WAREHOUSE", "AT_DEALER_WAREHOUSE", "IN_TRANSIT", "DELIVERED"],
      required: true,
    },

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
module.exports = mongoose.model("BarCodeFlow", BarCodeFlowSchema);
module.exports.searchKeys = [...searchKeys];
