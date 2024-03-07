const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DispositionOneSchema = new mongoose.Schema(
  {
    dispositionName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    dispositionDisplayName: {
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

const searchKeys = ["dispositionName", "companyId", "dispositionDisplayName"];
module.exports = mongoose.model("DispositionOne", DispositionOneSchema);
module.exports.searchKeys = [...searchKeys];
