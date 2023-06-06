const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const CompetitorSchema = mongoose.Schema(
  {
    competitorName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    websiteLink: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    youtubeLink: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    schemePrice: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    channelNameId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    startTime: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    endTime: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
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
  "competitorName",
  "companyName",
  "productName",
  "websiteLink",
  "youtubeLink",
  "whatsappNumber",
  "schemePrice",
  "companyId",
  "channelNameId",
];
module.exports = mongoose.model("Competitor", CompetitorSchema);
module.exports.searchKeys = [...searchKeys];
