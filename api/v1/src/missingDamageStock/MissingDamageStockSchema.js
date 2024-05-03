const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { dealerMissingDamageType } = require("../../helper/enumUtils");
const MissingOrDamageStockSchema = new mongoose.Schema(
  {
    dealerName: { type: String, required: true },
    dealerId: { type: ObjectId, required: false },
    barcode: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [dealerMissingDamageType.missing, dealerMissingDamageType.damage],
      default: dealerMissingDamageType.damage,
    },
    remark: { type: String, required: true, trim: true, lowercase: true },
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

const searchKeys = ["dealerName", "barcode", "type", "remark"];
module.exports = mongoose.model(
  "MissingOrDamageStock",
  MissingOrDamageStockSchema
);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
