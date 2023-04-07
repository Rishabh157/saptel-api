const mongoose = require("mongoose");
const StateSchema = new mongoose.Schema(
  {
    stateName: { type: String, required: true, trim: true, lowercase: true },
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

const searchKeys = ["stateName", "countryId"];
module.exports = mongoose.model("State", StateSchema);
module.exports.searchKeys = [...searchKeys]
