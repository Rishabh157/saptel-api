const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const InitialCallOneSchema = new mongoose.Schema(
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

const searchKeys = ["initialCallName", "companyId", "callType"];
module.exports = mongoose.model("initialcallone", InitialCallOneSchema);
module.exports.searchKeys = [...searchKeys];
