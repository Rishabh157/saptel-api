const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const TransportSchema = new mongoose.Schema(
  {
    transportName: {
      type: String,
      required: true,
      trim: true,
    },
    gst: { type: String, required: true, trim: true },
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

const searchKeys = ["transportName", "gst"];
module.exports = mongoose.model("Transport", TransportSchema);
module.exports.searchKeys = [...searchKeys];
