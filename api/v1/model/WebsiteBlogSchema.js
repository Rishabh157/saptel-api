const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const WebsiteBlogSchema = new mongoose.Schema(
  {
    blogName: { type: String, required: true, trim: true },
    blogTitle: { type: String, required: true, trim: true },
    blogSubtitle: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    image: { type: String, required: false, trim: true, default: "" },
    blogDescription: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
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
  "blogName",
  "blogTitle",
  "blogSubtitle",
  "image",
  "blogDescription",
];
module.exports = mongoose.model("WebsiteBlog", WebsiteBlogSchema);
module.exports.searchKeys = [...searchKeys];
