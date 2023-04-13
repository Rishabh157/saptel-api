const mongoose = require("mongoose");
const CountrySchema = new mongoose.Schema(
  {
    countryName: { type: String, required: true, trim: true, lowercase: true },
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

const searchKeys = ["countryName"];
module.exports = mongoose.model("Country", CountrySchema);
module.exports.searchKeys = [...searchKeys];
