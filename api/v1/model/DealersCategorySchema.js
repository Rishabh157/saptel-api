const mongoose = require("mongoose");
const DealersCategorySchema = new mongoose.Schema(
  {
    dealersCategory: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    investAmount: { type: Number, required: true },
    numberOfOrders: { type: Number, required: true },
    deliveryPercentage: { type: Number, required: true },
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

const searchKeys = [
  "dealersCategory",
  "investAmount",
  "numberOfOrders",
  "deliveryPercentage",
];
module.exports = mongoose.model("DealersCategory", DealersCategorySchema);
module.exports.searchKeys = [...searchKeys];
