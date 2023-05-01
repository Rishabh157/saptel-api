const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const BarCodeSchema = new mongoose.Schema(
  {
    productGroup: { type: ObjectId, required: true, trim: true },
    quantity: { type: Number, required: true },
    barcodeNumber: { type: String, required: true, trim: true },
    companyId: { type: String, required: true, trim: true },

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
