const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const InitialCallTwoSchema = new mongoose.Schema(
  {
    initialCallName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    callType: {
      type: String,
      required: true,
      enum: ["COMPLAINT", "INQUIRY"],
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
  "companyId",
  "callType",
];
module.exports = mongoose.model("initialCallTwo", InitialCallTwoSchema);
module.exports.searchKeys = [...searchKeys];
