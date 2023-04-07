const mongoose = require("mongoose");
const PincodeSchema = new mongoose.Schema(
  {
    pincode: { type: String, required: true, trim: true, lowercase: true },
    tehsilId: { type: String, required: true, trim: true, lowercase: true },
    districtId: { type: String, required: true, trim: true, lowercase: true },
    stateId: { type: String, required: true, trim: true, lowercase: true },
    countryId: { type: String, required: true, trim: true, lowercase: true },
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
  "pincode",
  "tehsilId",
  "districtId",
  "stateId",
  "countryId",
];
module.exports = mongoose.model("Pincode", PincodeSchema);
module.exports.searchKeys = [...searchKeys]
