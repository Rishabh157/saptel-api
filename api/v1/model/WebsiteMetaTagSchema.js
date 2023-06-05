const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const WebsiteMetaTagSchema = mongoose.Schema(
  {
    websitPageId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    websiteMasterId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    metaDescription: {
      type: String,
      required: true,
      trim: true,
    },
    metaKeyword: {
      type: String,
      required: true,
      trim: true,
    },
    metaOgTitle: {
      type: String,
      required: true,
      trim: true,
    },
    metaOgUrl: {
      type: String,
      required: true,
      trim: true,
    },
    metaOgImage: {
      type: String,
      required: true,
      trim: true,
    },
    metaOgDescription: {
      type: String,
      required: true,
      trim: true,
    },
    metaOgType: {
      type: String,
      required: true,
      trim: true,
    },
    metaTwitterTitle: {
      type: String,
      required: true,
      trim: true,
    },
    metaTwitterCard: {
      type: String,
      required: true,
      trim: true,
    },
    metaTwitterImage: {
      type: String,
      required: true,
      trim: true,
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
  "websitPageId",
  "websiteMasterId",
  "metaDescription",
  "metaKeyword",
  "metaOgTitle",
  "metaOgUrl",
  "metaOgImage",
  "metaOgDescription",
  "metaOgType",
  "metaTwitterTitle",
  "metaTwitterCard",
  "metaTwitterImage",
  "companyId",
];

module.exports = mongoose.model("WebsiteMetaTag", WebsiteMetaTagSchema);
module.exports.searchKeys = [...searchKeys];
