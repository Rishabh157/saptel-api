const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const CompetitorSchema = mongoose.Schema(
  {
    date: {
      type: String,
      required: false,
      default: "",
    },
    competitorName: {
      type: String,
      trim: true,
      lowercase: true,
    },
    productName: {
      type: String,
      trim: true,
      lowercase: true,
    },
    websiteLink: {
      type: String,
      trim: true,
    },
    video: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    maskedPhoneNo: {
      type: String,
      required: true,
    },
    schemePrice: {
      type: Number,
      trim: true,
      required: true,
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
      default: "",
      trim: true,
      lowercase: true,
    },
    endTime: {
      type: String,
      default: "",
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
