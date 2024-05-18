const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const CourierPreferenceSchema = new mongoose.Schema(
  {
    courierName: { type: String, required: true, trim: true, uppercase: true },
    priority: { type: Number, required: true },
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

const searchKeys = ["courierName"];
module.exports = mongoose.model("CourierPreference", CourierPreferenceSchema);
module.exports.searchKeys = [...searchKeys];
