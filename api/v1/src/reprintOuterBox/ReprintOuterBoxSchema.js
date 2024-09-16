const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const ReprintOuterBoxSchema = new mongoose.Schema(
  {
    serialNo: { type: Number, required: true, trim: true },
    outerBoxNumber: {
      type: String,
      required: true,
      trim: true,
    },
    innerBarcodes: {
      type: [String],
      required: true,
      trim: true,
    },
    createdBy: { type: String, required: true, trim: true },
    batchNumber: { type: String, required: true, trim: true },
    productId: { type: ObjectId, required: true, trim: true },
    expiryDate: { type: String, default: null, trim: true },

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
  "serialNo",
  "outerBoxNumber",
  "createdBy",
  "batchNumber",
  "productLabel",
];
module.exports = mongoose.model("ReprintOuterBox", ReprintOuterBoxSchema);
module.exports.searchKeys = [...searchKeys];
