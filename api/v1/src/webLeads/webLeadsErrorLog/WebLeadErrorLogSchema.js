const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const WebLeadsErrorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },

    product_name: { type: String, default: "", trim: true },
    response: { type: Object, default: {} },
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

const searchKeys = ["phone", "name"];

module.exports = mongoose.model("WebLeadsError", WebLeadsErrorSchema);
module.exports.searchKeys = [...searchKeys];
