const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const ChannelUpdationSchema = mongoose.Schema(
  {
    slotId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    run: {
      type: Boolean,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    remark: {
      type: String,
      trim: true,
      lowercase: true,
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
  "slotId",
  "companyId",
  "run",
  "startTime",
  "endTime",
  "remark",
];

module.exports = mongoose.model("ChannelUpdation", ChannelUpdationSchema);
module.exports.searchKeys = [...searchKeys];
