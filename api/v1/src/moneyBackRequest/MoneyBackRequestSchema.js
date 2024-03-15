const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const MoneyBackRequestSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      trim: true,
    },
    complaintNumber: {
      type: String,
      required: true,
      trim: true,
    },
    schemeId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    dealerId: {
      type: ObjectId,
      default: null,
      trim: true,
    },
    wareHouseId: {
      type: ObjectId,
      default: null,
      trim: true,
    },
    dateOfDelivery: {
      type: String,
      default: "",
      trim: true,
    },
    requestResolveDate: {
      type: String,
      default: "",
      trim: true,
    },
    settledAmount: {
      type: String,
      default: "",
      trim: true,
    },
    amountInWords: {
      type: String,
      default: "",
      trim: true,
    },
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    stateId: { type: ObjectId, required: true },
    districtId: { type: ObjectId, required: true },
    tehsilId: { type: ObjectId, required: true },
    pincode: { type: ObjectId, required: true },
    customerNumber: {
      type: String,
      required: true,
      trim: true,
    },
    alternateNumber: {
      type: String,
      default: "",
      trim: true,
    },
    bankName: {
      type: String,
      default: "",
      trim: true,
    },
    accountNumber: {
      type: String,
      default: "",
      trim: true,
    },
    ifscCode: {
      type: String,
      default: "",
      trim: true,
    },
    ccRemark: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    ccApproval: {
      type: Boolean,
      default: false,
      trim: true,
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
    accountApproval: {
      type: Boolean,
      default: null,
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
    managerFirstApproval: {
      type: Boolean,
      default: null,
      trim: true,
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
    managerSecondApproval: {
      type: Boolean,
      default: null,
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

const searchKeys = ["orderNumber", "complaintNumber"];
module.exports = mongoose.model("MoneyBackRequest", MoneyBackRequestSchema);
module.exports.searchKeys = [...searchKeys];
