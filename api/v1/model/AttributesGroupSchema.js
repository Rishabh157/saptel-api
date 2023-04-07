const mongoose = require("mongoose");
const AttributesGroupSchema = new mongoose.Schema(
  {
    groupeName: { type: String, required: true, trim: true, lowercase: true },
    attributes: {
      type: [String],
      required: true,
      minlength: 1
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

const searchKeys = ["groupeName", "attributes"];
module.exports = mongoose.model("AttributesGroup", AttributesGroupSchema);
module.exports.searchKeys = [...searchKeys]
