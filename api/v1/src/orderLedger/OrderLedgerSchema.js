const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { ledgerType } = require("../../helper/enumUtils");
const OrderLedgerSchema = new mongoose.Schema(
  {
    noteType: {
      type: String,
      enum: [
        ledgerType.credit,
        ledgerType.debit,
        ledgerType.dealerAmountCredited,
      ],
      uppercase: true,
      default: ledgerType.dealerAmountCredited,
    },
    creditAmount: {
      type: Number,
      trim: true,
    },
    debitAmount: {
      type: Number,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    remark: {
      type: String,
      trim: true,
      lowercase: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
    },
    dealerId: {
      type: ObjectId,
      required: true,
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

const searchKeys = ["noteType", "remark", "companyId", "dealerId"];
module.exports = mongoose.model("OrderLedger", OrderLedgerSchema);
module.exports.searchKeys = [...searchKeys];
