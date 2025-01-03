// model schema starts here

const mongoose = require("mongoose");
const fileManagerSchema = new mongoose.Schema(
  {
    fileType: {
      type: String,
      enum: ["IMAGE", "DOCUMENT", "VIDEO"],
      default: "IMAGE",
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const searchKeys = ["fileType", "fileUrl", "category", "isActive"];
module.exports = mongoose.model("FileManager", fileManagerSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
