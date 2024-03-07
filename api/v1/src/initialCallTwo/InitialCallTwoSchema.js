const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { complaintType } = require("../../helper/enumUtils");
const InitialCallTwoSchema = new mongoose.Schema(
  {
    initialCallName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    initialCallDisplayName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    callType: {
      type: String,
      required: true,
      enum: [
        complaintType.complaint,
        complaintType.inquiry,
        complaintType.feedback,
      ],
    },
    initialCallOneId: {
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
  "initialCallDisplayName",
  "callType",
];
module.exports = mongoose.model("initialCallTwo", InitialCallTwoSchema);
module.exports.searchKeys = [...searchKeys];
