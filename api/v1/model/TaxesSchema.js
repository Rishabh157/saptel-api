const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const TaxesSchema = new mongoose.Schema(
  {
    taxName: { type: String, required: true, trim: true, lowercase: true },
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

const searchKeys = ["taxName"];
module.exports = mongoose.model("Tax", TaxesSchema);
module.exports.searchKeys = [...searchKeys];
