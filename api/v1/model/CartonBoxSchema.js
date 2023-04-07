const mongoose = require("mongoose");
const CartonBoxSchema = new mongoose.Schema(
  {
    boxName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    innerItemCount: {
      type: Number,
      required: true,
    },
    dimension: {
      type: {
        height: {
          type: Number,
          required: true,
        },

        weight: {
          type: Number,
          required: true,
        },

        depth: {
          type: Number,
          required: true,
        },
      },

      required: true,
    },

    boxWeight: {
      type: Number,
      required: true,
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

const searchKeys = ["boxName", "innerItemCount", "dimension", "boxWeight"];
module.exports = mongoose.model("CartonBox", CartonBoxSchema);
module.exports.searchKeys = [...searchKeys];
