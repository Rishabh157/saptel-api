const mongoose = require("mongoose");
const AttributesSchema = new mongoose.Schema(
  {
    attributeName: {
      type: String,
      required: true,
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

const searchKeys = ["attributeName"];
module.exports.searchKeys = [...searchKeys]
module.exports = mongoose.model("Attributes", AttributesSchema);
