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
      default: "",
      trim: true,
    },
    metaKeyword: {
      type: String,
      default: "",
      trim: true,
    },
    metaOgTitle: {
      type: String,
      default: "",
      trim: true,
    },
    metaOgUrl: {
      type: String,
      default: "",
      trim: true,
    },
    metaOgImage: {
      type: String,
      default: "",
      trim: true,
    },
    metaOgDescription: {
      type: String,
      default: "",
      trim: true,
    },
    metaOgType: {
      type: String,
      default: "",
      trim: true,
    },
    metaTwitterTitle: {
      type: String,
      default: "",
      trim: true,
    },
    metaTwitterCard: {
      type: String,
      default: "",
      trim: true,
    },
    metaTwitterImage: {
      type: String,
      default: "",
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
