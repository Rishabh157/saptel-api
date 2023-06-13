const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ZonalManagerSchema = new mongoose.Schema(
  {
    dealerId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    zonalManagerName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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

const searchKeys = ["dealerId", "zonalManagerName", "companyId"];
module.exports = mongoose.model("ZonalManager", ZonalManagerSchema);
module.exports.searchKeys = [...searchKeys];
