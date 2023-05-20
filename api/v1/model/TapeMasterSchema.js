// model schema starts here

const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { tapeType } = require("../helper/enumUtils");
const TapeMasterSchema = new mongoose.Schema(
  {
    tapeName: { type: String, required: true, trim: true, lowercase: true },
    channelGroup: {
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
    scheme: { type: ObjectId, required: false, default: null },
    language: { type: ObjectId, required: true },
    duration: { type: String, required: true, trim: true, lowercase: true },
    youtubeLink: { type: String, required: false, trim: true, default: "" },
    artist: { type: ObjectId, required: true },
    companyId: { type: ObjectId, required: true },
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
];
module.exports = mongoose.model("TapeMaster", TapeMasterSchema);
module.exports.searchKeys = [...searchKeys];
