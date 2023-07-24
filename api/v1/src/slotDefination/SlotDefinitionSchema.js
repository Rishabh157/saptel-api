const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const {
  slotType,
  slotDaysType,
  reasonNotShowSlot,
} = require("../../helper/enumUtils");
const SlotDefinitionSchema = new mongoose.Schema(
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

    tapeNameId: { type: ObjectId, required: true },
    channelNameId: { type: ObjectId, required: true },
    slotStartDate: {
      type: String,
      required: true,
      trim: true,
    },
    slotPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    slotContinueStatus: {
      type: Boolean,
      required: true,
      default: true,
    },

    slotDay: {
      type: [String],
      required: true,
      enum: [
        slotDaysType.monday,
        slotDaysType.tuesday,
        slotDaysType.wednesday,
        slotDaysType.thursday,
        slotDaysType.friday,
        slotDaysType.saturday,
        slotDaysType.sunday,
      ],
      default: [slotDaysType.monday],
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
module.exports = mongoose.model("SlotDefinition", SlotDefinitionSchema);
module.exports.searchKeys = [...searchKeys];
