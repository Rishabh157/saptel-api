const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const WebsitePageSchema = new mongoose.Schema(
  {
    pageUrl: { type: String, required: true, trim: true },
    pageName: { type: String, required: true, trim: true },
    headerSpace: { type: String, required: false, trim: true, default: "" },
    footerSpace: { type: String, required: false, trim: true, default: "" },
    websiteId: { type: ObjectId, required: true, trim: true },
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
  "pageUrl",
  "pageName",
  "headerSpace",
  "footerSpace",
  "websiteId",
  "websiteLabel",
];
module.exports = mongoose.model("WebsitePage", WebsitePageSchema);
module.exports.searchKeys = [...searchKeys];
