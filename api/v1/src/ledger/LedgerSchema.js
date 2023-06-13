const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { ledgerType } = require("../../helper/enumUtils");
const LedgerSchema = new mongoose.Schema(
  {
    noteType: {
      type: String,
      enum: [ledgerType.credit, ledgerType.debit],
      uppercase: true,
      default: ledgerType.credit,
    },
    price: { type: Number, required: true, trim: true },
    remark: { type: String, required: true, trim: true, lowercase: true },
    companyId: { type: ObjectId, required: true },
    dealerId: { type: ObjectId, required: true },
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

const searchKeys = ["noteType", "price", "remark", "companyId", "dealerId"];
module.exports = mongoose.model("Ledger", LedgerSchema);
module.exports.searchKeys = [...searchKeys];
