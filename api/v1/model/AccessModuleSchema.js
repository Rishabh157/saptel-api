// model schema starts here

const mongoose = require("mongoose");
const AccessmoduleSchema = new mongoose.Schema(
  {
    moduleName: { type: String, required: true, trim: true, uppercase: true },
    action: { type: String, required: true, trim: true, uppercase: true },
    route: { type: String, required: true, trim: true, lowercase: true },
    method: { type: String, required: true, trim: true, uppercase: true },
    fields: {
      type: [
        {
          displayName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
        },
        {
          fieldName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
        },
      ],
      default: [],
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
  "moduleName",
  "action",
  "route",
  "method",
  "fields",
];
module.exports.searchKeys = [...searchKeys]
module.exports = mongoose.model("Accessmodule", AccessmoduleSchema);
