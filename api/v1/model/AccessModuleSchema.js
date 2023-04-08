// model schema starts here

const mongoose = require("mongoose");
const AccessmoduleSchema = new mongoose.Schema(
  {
    moduleName: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true, uppercase: true },
    route: { type: String, required: true, trim: true, lowercase: true },
    method: { type: String, required: true, trim: true, uppercase: true },
    moduleDisplayName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    moduleRank: { type: Number, required: true, default: 1 },
    featureDisplayName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    featureRank: { type: Number, required: true, default: 1 },
    featureName: { type: String, required: true, trim: true, lowercase: true },

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
const allFields = Object.keys(AccessmoduleSchema.obj);
const searchKeys = ["moduleName", "action", "route", "method", "fields"];
module.exports = mongoose.model("Accessmodule", AccessmoduleSchema);
module.exports.searchKeys = [...searchKeys];
module.exports.allFields = [...allFields];
