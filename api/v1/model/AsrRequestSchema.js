const mongoose = require("mongoose");
const AsrRequestSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true, lowercase: true },
    quantity: { type: Number, required: true },
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

const searchKeys = ["productName", "quantity"];
module.exports = mongoose.model("AsrRequest", AsrRequestSchema);
module.exports.searchKeys = [...searchKeys];
