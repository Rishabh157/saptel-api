const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const CallCenterMasterSchema = new mongoose.Schema(
  {
    callCenterName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    isAgent: { type: Boolean, default: false },
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

const searchKeys = ["callCenterName"];
module.exports = mongoose.model("CallCenterMaster", CallCenterMasterSchema);
module.exports.searchKeys = [...searchKeys];
