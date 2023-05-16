const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DidManagementSchema = new mongoose.Schema(
  {
    didNumber: { type: String, required: true, trim: true, lowercase: true },
    companyId: { type: ObjectId, required: true },

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

const searchKeys = ["didNumber"];
module.exports = mongoose.model("DidManagement", DidManagementSchema);
module.exports.searchKeys = [...searchKeys];
