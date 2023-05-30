const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { complaintType } = require("../helper/enumUtils");
const InitialCallThreeSchema = new mongoose.Schema(
  {
    complaintType: {
      type: String,
      enum: [complaintType.complaint, complaintType.enquiry],
      required: true,
    },
    emailType: {
      type: String,
      enum: ["EMAIL1", "EMAIL2"],
      required: true,
    },
    smsType: {
      type: String,
      enum: ["SMS1", "SMS2"],
      required: true,
    },
    returnType: {
      type: [String],
      enum: ["ESCALATE", "REPLACEMENT", "REFUND"],
      required: true,
    },
    isPnd: {
      type: Boolean,
      required: false,
      default: false,
    },
    cancelFlag: {
      type: Boolean,
      required: false,
      default: false,
    },
    initialCallName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    initialCallOneId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    initialCallTwoId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
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
  "initialCallName",
  "initialCallOneId",
  "initialCallTwoId",
  "companyId",
  "complaintType",
  "emailType",
  "smsType",
  "returnType",
];
module.exports = mongoose.model("InitialCallThree", InitialCallThreeSchema);
module.exports.searchKeys = [...searchKeys];
