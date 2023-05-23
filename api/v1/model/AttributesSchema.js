const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const AttributesSchema = new mongoose.Schema(
  {
    attributeName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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

const searchKeys = ["attributeName"];
module.exports = mongoose.model("Attributes", AttributesSchema);
module.exports.searchKeys = [...searchKeys];
