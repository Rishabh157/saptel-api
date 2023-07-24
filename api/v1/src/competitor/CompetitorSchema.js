const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { competitorProductCategory } = require("../../helper/enumUtils");

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
    ytLink: {
      type: String,
      required: false,
      default: "",
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
    languageId: {
      type: ObjectId,
      required: true,
    },
    image: {
      type: [String],
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
      enum: [
        competitorProductCategory.herbal,
        competitorProductCategory.education,
        competitorProductCategory.spiritual,
        competitorProductCategory.other,
      ],
      default: [competitorProductCategory.herbal],
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
