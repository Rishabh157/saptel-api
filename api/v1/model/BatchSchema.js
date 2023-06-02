const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const BatchSchema = mongoose.Schema(
  {
    batchNo: {
      type: Number,
      required: true,
      trim: true,
    },
    orderCount: {
      type: Number,
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

const searchKeys = ["batchNo"];

module.exports = mongoose.model("batch", BatchSchema);
module.exports.searchKeys = [...searchKeys];
