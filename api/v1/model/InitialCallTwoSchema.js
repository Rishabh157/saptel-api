const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const InitialCallTwoSchema = new mongoose.Schema(
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

const searchKeys = ["initialCallName", "initialCallOneId", "companyId"];
module.exports = mongoose.model("initialCallTwo", InitialCallTwoSchema);
module.exports.searchKeys = [...searchKeys];
