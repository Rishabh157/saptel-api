const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { courierType, transportType } = require("../../helper/enumUtils");
const CourierPreferenceSchema = new mongoose.Schema(
  {
    courierName: { type: String, required: true, trim: true, uppercase: true },
    courierCode: { type: String, required: true, trim: true, uppercase: true },
    courierType: {
      type: String,
      enum: [courierType.awb, courierType.api],
      trim: true,
    },
    transportType: {
      type: String,
      enum: [transportType.air, transportType.surface],
      trim: true,
    },

    isApiAvailable: {
      type: Boolean,
      default: false,
    },
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
