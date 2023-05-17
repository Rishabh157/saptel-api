const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ChannelGroupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, trim: true, lowercase: true },
    companyId: { type: ObjectId, required: true, trim: true },
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

const searchKeys = ["groupName", "companyId"];
module.exports = mongoose.model("ChannelGroup", ChannelGroupSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
