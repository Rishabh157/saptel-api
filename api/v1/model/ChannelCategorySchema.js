const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ChannelCategorySchema = new mongoose.Schema(
  {
    channelCategory: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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

const searchKeys = ["channelCategory", "companyId"];
module.exports = mongoose.model("ChannelCategory", ChannelCategorySchema);
module.exports.searchKeys = [...searchKeys];
