const mongoose = require("mongoose");
const CourierServiceSchema = new mongoose.Schema(
  {
    pickup_pincode: { type: Number, required: false, trim: true },
    delivery_pincode: { type: Number, required: false, trim: true },
    weight: { type: Number, required: false, trim: true },
    paymentmode: { type: String, required: false, trim: true },
    invoicevalue: { type: Number, required: false, trim: true },
    length: { type: Number, required: false, trim: true },
    width: { type: Number, required: false, trim: true },
    height: { type: Number, required: false, trim: true },
    weight2: { type: Number, required: false, trim: true },
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
  "pickup_pincode",
  "delivery_pincode",
  "weight",
  "paymentmode",
  "invoicevalue",
  "length",
  "width",
  "height",
  "weight2",
];
module.exports = mongoose.model("CourierService", CourierServiceSchema);
module.exports.searchKeys = [...searchKeys];
