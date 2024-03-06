const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DispositionTwoSchema = mongoose.Schema(
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
    dispositionOneId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
      trim: true,
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

const searchKeys = ["dispositionName", "dispositionOneId", "companyId"];
module.exports = mongoose.model("dispositionTwo", DispositionTwoSchema);
module.exports.searchKeys = [...searchKeys];
