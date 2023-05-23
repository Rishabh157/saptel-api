const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const LanguageSchema = new mongoose.Schema(
  {
    languageName: { type: String, required: true, trim: true, lowercase: true },
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

const searchKeys = ["languageName"];
module.exports = mongoose.model("Language", LanguageSchema);
module.exports.searchKeys = [...searchKeys];
