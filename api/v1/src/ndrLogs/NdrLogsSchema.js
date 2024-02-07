const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const NdrLogsSchema = new mongoose.Schema(
  {
    ndrId: { type: ObjectId, required: true, trim: true },
    ndrCreatedById: { type: ObjectId, required: true, trim: true },
    orderNumber: {
      type: Number,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    addressLine2: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    pincode: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    district: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    state: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    callDisposition: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    rtoReattemptReason: {
      type: String,
      enum: ["", "DC_FOR", "DC_UOR"],
      default: "",
    },
    validCourierRemark: {
      type: String,
      enum: ["CORRECT", "NOT_CORRECT", "NA"],
    },
    reAttemptDate: {
      type: String,
      required: false,
      trim: true,
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
  "orderNumber",
  "pincodeLabel",
  "districtLabel",
  "stateLabel",
  "callDispositionLabel",
  "rtoReattemptReason",
  "ndrCreatedByLabel",
];
module.exports = mongoose.model("NdrLogs", NdrLogsSchema);
module.exports.searchKeys = [...searchKeys];
