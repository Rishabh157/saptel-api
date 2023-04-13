const mongoose = require("mongoose");
const AreaSchema = new mongoose.Schema(
  {
    area: { type: String, required: true, trim: true, lowercase: true },
    pincodeId: { type: String, required: true, trim: true },
    tehsilId: { type: String, required: true, trim: true },
    districtId: { type: String, required: true, trim: true },
    stateId: { type: String, required: true, trim: true },
    countryId: { type: String, required: true, trim: true },
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

const searchKeys = [
  "area",
  "pincodeId",
  "tehsilId",
  "districtId",
  "stateId",
  "countryId",
];
module.exports = mongoose.model("Area", AreaSchema);
module.exports.searchKeys = [...searchKeys];
