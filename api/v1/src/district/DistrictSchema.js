const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { preferredCourierPartner } = require("../../helper/enumUtils");
const DistrictSchema = new mongoose.Schema(
  {
    districtName: { type: String, required: true, trim: true, lowercase: true },
    stateId: { type: ObjectId, required: true, trim: true },
    countryId: { type: ObjectId, required: true, trim: true },

    preferredCourier: {
      type: String,
      enum: [preferredCourierPartner.shipyaari, preferredCourierPartner.gpo],
      default: preferredCourierPartner.shipyaari,
    },
    companyId: { type: ObjectId, required: true, trim: true },
    isFixed: {
      type: Boolean,
      default: false,
    },
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
module.exports = mongoose.model("District", DistrictSchema);
module.exports.searchKeys = [...searchKeys];
