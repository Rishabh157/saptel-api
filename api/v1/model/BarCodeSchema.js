const mongoose = require("mongoose");
const BarCodeSchema = new mongoose.Schema(
  {
    productGroup: { type: String, required: true, trim: true },
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

const searchKeys = ["productGroup", "quantity"];
module.exports = mongoose.model("BarCode", BarCodeSchema);
module.exports.searchKeys = [...searchKeys];
