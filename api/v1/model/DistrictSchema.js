const mongoose = require("mongoose");
const DistrictSchema = new mongoose.Schema(
  {
    districtName: { type: String, required: true, trim: true, lowercase: true },
    stateId: { type: String, required: true, trim: true },
    countryId: { type: String, required: true, trim: true },
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

const searchKeys = ["districtName", "stateId", "countryId"];
module.exports.searchKeys = [...searchKeys]
module.exports = mongoose.model("District", DistrictSchema);
