const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ChannelManagementSchema = new mongoose.Schema(
  {
    channelName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    channelGroupId: {
      type: ObjectId,
      required: true,
    },
    didNumberId: {
      type: ObjectId,
      required: true,
      trim: true,
      lowercase: true,
    },
    schemeId: {
      type: ObjectId,
      required: true,
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
  "channelName",
  "channelGroupId",
  "didNumberId",
  "schemeId",
  "companyId",
];
module.exports = mongoose.model("ChannelManagement", ChannelManagementSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
