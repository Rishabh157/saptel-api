const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { slotType, slotDaysType } = require("../helper/enumUtils");
const SlotMasterSchema = new mongoose.Schema(
  {
    slotName: { type: String, required: true, trim: true, lowercase: true },
    channelGroupId: { type: ObjectId, required: true },

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
    tapeNameId: { type: ObjectId, required: true },
    channelNameId: { type: ObjectId, required: true },

    slotDate: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    slotStartTime: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    slotEndTime: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    channelTrp: { type: String, required: true, trim: true, lowercase: true },
    companyId: { type: ObjectId, required: true, trim: true },
    remarks: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: "",
    },

    run: {
      type: Boolean,
      required: false,
      default: false,
    },
    runStartTime: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    runEndTime: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    runRemark: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    runYoutubeLink: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    runStatus: {
      type: Boolean,
      required: false,
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

const searchKeys = [
  "slotName",
  "channelGroup",
  "startDateTime",
  "type",
  "days",
  "tapeNameId",
  "channelNameId",
  "companyId",
  "endDateTime",
  "channelTrp",
  "remarks",
  "run",
  "runStartTime",
  "runEndTime",
  "runRemark",
  "channelLabel",
  "groupNameLabel",
  "tapeLabel",
];
module.exports = mongoose.model("SlotMaster", SlotMasterSchema);
module.exports.searchKeys = [...searchKeys];
