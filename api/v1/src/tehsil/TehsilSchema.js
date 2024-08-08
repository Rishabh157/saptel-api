const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { preferredCourierPartner } = require("../../helper/enumUtils");
const TehsilSchema = new mongoose.Schema(
  {
    tehsilName: { type: String, required: true, trim: true, lowercase: true },
    districtId: { type: ObjectId, required: true, trim: true },
    stateId: { type: ObjectId, required: true, trim: true },
    countryId: { type: ObjectId, required: true, trim: true },
    preferredCourier: {
      type: [
        {
          courierId: {
            type: ObjectId,
            required: true,
          },
          courierName: {
            type: ObjectId,
            required: true,
          },
          priority: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
    // companyId: { type: ObjectId, required: true, trim: true },
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

const searchKeys = ["tehsilName", "districtId", "stateId", "countryId"];
module.exports = mongoose.model("Tehsil", TehsilSchema);
module.exports.searchKeys = [...searchKeys];
