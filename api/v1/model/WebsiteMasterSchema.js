const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const WebsiteMasterSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true, lowercase: true },
    url: { type: String, required: true, trim: true },
    gaTagIp: { type: String, required: false, trim: true, default: "" },
    searchConsoleIp: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    headerSpace: { type: String, required: false, trim: true, default: "" },
    footerSpace: { type: String, required: false, trim: true, default: "" },
    siteMap: { type: String, required: false, trim: true, default: "" },
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
  "productName",
  "url",
  "gaTagIp",
  "searchConsoleIp",
  "headerSpace",
  "footerSpace",
  "siteMap",
];
module.exports = mongoose.model("WebsiteMaster", WebsiteMasterSchema);
module.exports.searchKeys = [...searchKeys];
