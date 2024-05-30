const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { ledgerType } = require("../../helper/enumUtils");
const LedgerSchema = new mongoose.Schema(
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
    taxAmount: {
      type: Number,
      default: 0,
      trim: true,
    },
    ledgerNumber: {
      type: Number,
      required: true,
    },

    creditAmount: {
      type: Number,
      required: true,
      trim: true,
    },
    debitAmount: {
      type: Number,
      required: true,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    remark: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    itemId: {
      type: ObjectId,
      required: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
    },
    dealerId: {
      type: ObjectId,
      required: true,
    },
    // ledgerNo: {
    //   type: String,
    //   required: true,
    // },
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
module.exports = mongoose.model("Ledger", LedgerSchema);
module.exports.searchKeys = [...searchKeys];
