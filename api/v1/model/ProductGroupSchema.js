const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ProductGroupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, trim: true, lowercase: true },
    tax: {
      type: [
        {
          taxName: {
            type: String,
            required: true,
            trim: true,
          },

          taxPercent: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
    companyId: { type: String, required: true, trim: true },
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

const searchKeys = ["groupName"];
module.exports = mongoose.model("ProductGroup", ProductGroupSchema);
module.exports.searchKeys = [...searchKeys];
