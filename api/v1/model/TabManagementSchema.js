const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const TabManagementSchema = new mongoose.Schema(
  {
    tabCode: { 
      type: String,
       required: true,
        trim: true 
      },
    youtubeLink: { 
      type: String, 
      required: true,
       trim: true
       },
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

const searchKeys = ["tabCode", "youtubeLink", "companyId"];
module.exports = mongoose.model("TabManagement", TabManagementSchema);
module.exports.searchKeys = [...searchKeys];
