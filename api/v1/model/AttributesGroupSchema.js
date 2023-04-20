const mongoose = require("mongoose");
const AttributesGroupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, trim: true, lowercase: true },
    attributes: {
      type: [
        {
          label: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          value: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      required: true,
      minlength: 1,
    },
    companyId: { type: String, required: true, trim: true },
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
module.exports.searchKeys = [...searchKeys];
