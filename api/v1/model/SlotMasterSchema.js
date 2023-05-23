const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { slotType, slotDaysType } = require("../helper/enumUtils");
const SlotMasterSchema = new mongoose.Schema(
  {
    slotName: { type: String, required: true, trim: true, lowercase: true },
    channelGroup: { type: ObjectId, required: true },
    startDateTime: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: [slotType.fixed, slotType.flexible],
      uppercase: true,
      required: true,
      default: slotType.fixed,
    },

    days: {
      type: [String],
      enum: [
        slotDaysType.monday,
        slotDaysType.tuesday,
        slotDaysType.wednesday,
        slotDaysType.thursday,
        slotDaysType.friday,
        slotDaysType.saturday,
        slotDaysType.sunday,
      ],
      uppercase: true,
      required: true,
      default: slotDaysType.monday,
    },
    tapeName: { type: ObjectId, required: true },
    channelName: { type: ObjectId, required: true },
    endDateTime: { type: String, required: true, trim: true, lowercase: true },
    channelTrp: { type: String, required: true, trim: true, lowercase: true },
    remarks: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: "",
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

const searchKeys = [
  "slotName",
  "channelGroup",
  "startDateTime",
  "type",
  "days",
  "tapeName",
  "channelName",
  "endDateTime",
  "channelTrp",
  "remarks",
];
module.exports = mongoose.model("SlotMaster", SlotMasterSchema);
module.exports.searchKeys = [...searchKeys];
