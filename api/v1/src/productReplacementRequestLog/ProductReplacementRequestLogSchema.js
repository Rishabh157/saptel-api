const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ProductReplacementRequestLogSchema = new mongoose.Schema(
  {
    productReplacementRequestId: {
      type: ObjectId,
      required: true,
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
    },
    replacedSchemeId: {
      type: ObjectId,
      default: null,
    },
    replacedSchemeLabel: {
      type: String,
      default: "",
    },
    productGroupId: {
      type: ObjectId,
      default: null,
    },
    companyId: {
      type: ObjectId,
      required: true,
    },
    managerFirstUserId: {
      type: ObjectId,
      default: null,
    },
    manageSecondUserId: {
      type: ObjectId,
      default: null,
    },
    ccInfoAddById: {
      type: ObjectId,
      default: null,
    },
    accoutUserId: {
      type: ObjectId,
      default: null,
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
  "productReplacementRequestId",
  "complaintNumber",
  "ccRemark",
  "ccApprovalDate",
  "accountRemark",
  "accountApprovalDate",
  "managerFirstRemark",
  "managerFirstApprovalDate",
  "managerSecondRemark",
  "managerSecondApprovalDate",
  "companyId",
];
module.exports = mongoose.model(
  "ProductReplacementRequestLog",
  ProductReplacementRequestLogSchema
);
module.exports.searchKeys = [...searchKeys];
