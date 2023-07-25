const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DidManagementSchema = new mongoose.Schema(
  {
    didNumber: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    slotId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    schemeId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    channelId: {
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
  "didNumber",
  "schemeId",
  "channelId",
  "companyId",
  "schemeLabel",
  "channelLabel",
];
module.exports = mongoose.model("DidManagement", DidManagementSchema);
module.exports.searchKeys = [...searchKeys];
