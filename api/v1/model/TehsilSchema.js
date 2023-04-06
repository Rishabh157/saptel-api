const mongoose = require("mongoose");
const TehsilSchema = new mongoose.Schema(
  {
    tehsilName: { type: String, required: true, trim: true, lowercase: true },
    districtId: { type: String, required: true, trim: true },
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

const searchKeys = [
  "tehsilName",
  "districtId",
  "stateId",
  "countryId",
];
module.exports.searchKeys = [...searchKeys]
module.exports = mongoose.model("Tehsil", TehsilSchema);
