const mongoose = require("mongoose");
const CountrySchema = new mongoose.Schema(
  {
    countryName: { type: String, required: true, trim: true, lowercase: true },
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

const searchKeys = ["countryName"];
module.exports.searchKeys = [...searchKeys]
module.exports = mongoose.model("Country", CountrySchema);
