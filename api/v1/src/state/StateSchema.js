const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { preferredCourierPartner } = require("../../helper/enumUtils");
const StateSchema = new mongoose.Schema(
  {
    stateName: { type: String, required: true, trim: true, lowercase: true },
    countryId: { type: ObjectId, required: true, trim: true },
    // companyId: { type: ObjectId, required: true, trim: true },

    preferredCourier: {
      type: [
        {
          courierId: {
            type: ObjectId,
            required: true,
          },
          courierName: {
            type: String,
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
    isUnion: {
      type: Boolean,
      default: false,
    },
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

const searchKeys = ["stateName", "countryId"];
module.exports = mongoose.model("State", StateSchema);
module.exports.searchKeys = [...searchKeys];
