const mongoose = require("mongoose");
const TaxesSchema = new mongoose.Schema(
  {
    taxName: { type: String, required: true, trim: true, lowercase: true },
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
module.exports = mongoose.model("Taxes", TaxesSchema);
module.exports.searchKeys = [...searchKeys];
