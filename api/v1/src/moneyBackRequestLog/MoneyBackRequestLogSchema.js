const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const MoneyBackRequestLogSchema = new mongoose.Schema(
  {
    moneyBackRequestId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    complaintNumber: {
      type: String,
      required: true,
    },
    ccRemark: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    ccApprovalDate: {
      type: String,
      default: "",
      trim: true,
    },
    accountRemark: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    accountApprovalDate: {
      type: String,
      default: "",
      trim: true,
    },
    managerFirstRemark: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    managerFirstApprovalDate: {
      type: String,
      default: "",
      trim: true,
    },
    managerSecondRemark: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    managerSecondApprovalDate: {
      type: String,
      default: "",
      trim: true,
    },
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

const searchKeys = ["complaintNumber"];
module.exports = mongoose.model(
  "MoneyBackRequestLog",
  MoneyBackRequestLogSchema
);
module.exports.searchKeys = [...searchKeys];
