const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const InitialCallOneSchema = new mongoose.Schema(
  {
    initailCallName: {
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

const searchKeys = ["initailCallName", "companyId"];
module.exports = mongoose.model("InitailCallOne", InitialCallOneSchema);
module.exports.searchKeys = [...searchKeys];
