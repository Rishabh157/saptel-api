const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { ledgerType } = require("../../helper/enumUtils");
const VendorLedgerSchema = new mongoose.Schema(
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
    companyId: {
      type: ObjectId,
      required: true,
    },
    vendorId: {
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

const searchKeys = ["noteType", "remark", "companyId", "vendorId"];
module.exports = mongoose.model("VendorLedger", VendorLedgerSchema);
module.exports.searchKeys = [...searchKeys];
