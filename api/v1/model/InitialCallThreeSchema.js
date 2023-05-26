const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const InitialCallThreeSchema = new mongoose.Schema(
  {
    initialCallName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    initialCallOneId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    initialCallTwoId: {
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
  "initialCallName",
  "initialCallOneId",
  "initialCallTwoId",
  "companyId",
];
module.exports = mongoose.model("InitialCallThree", InitialCallThreeSchema);
module.exports.searchKeys = [...searchKeys];
