const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const DispositionThreeSchema = new mongoose.Schema(
  {
    dispositionName: {
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
    dispositionTwoId: {
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
const searchKeys = [
  "dispositionName",
  "dispositionOneId",
  "dispositionTwoId",
  "companyId",
];
module.exports = mongoose.model("dispositionThree", DispositionThreeSchema);
module.exports.searchKeys = [...searchKeys];
