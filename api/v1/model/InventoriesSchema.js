const mongoose = require("mongoose");
const InventoriesSchema = new mongoose.Schema(
  {
    packaging: { type: String, required: true, trim: true },
    barCode: { type: String, required: true, trim: true, lowercase: true },
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

const searchKeys = ["packaging", "barCode"];
module.exports = mongoose.model("Inventories", InventoriesSchema);
module.exports.searchKeys = [...searchKeys];
