// model schema starts here

const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { tapeType } = require("../helper/enumUtils");
const TapeMasterSchema = new mongoose.Schema(
  {
    tapeName: { type: String, required: true, trim: true, lowercase: true },
    channelGroupId: {
      type: ObjectId,
      required: false,
      default: null,
    },
    tapeType: {
      type: String,
      enum: [tapeType.schemeCode, tapeType.promotional, tapeType.intruption],
      uppercase: true,
      required: true,
      default: tapeType.promotional,
    },
    schemeId: { type: ObjectId, required: false, default: null },
    languageId: { type: ObjectId, required: true },
    duration: { type: String, required: true, trim: true, lowercase: true },
    youtubeLink: { type: String, required: false, trim: true, default: "" },
    artistId: { type: [ObjectId], required: true, trim: true },
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
  "tapeName",
  "channelGroup",
  "tapeType",
  "scheme",
  "language",
  "duration",
  "artist",
  "remarks",
  "schemeLabel",
  "channelGroupLabel",
];
module.exports = mongoose.model("TapeMaster", TapeMasterSchema);
module.exports.searchKeys = [...searchKeys];
