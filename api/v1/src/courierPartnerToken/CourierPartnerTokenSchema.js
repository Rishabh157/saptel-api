const mongoose = require("mongoose");
const CourierServiceSchema = new mongoose.Schema(
  {
    courierPartnerName: { type: String, required: false, uppercase: true },
    token: { type: String, required: true, trim: true },

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
module.exports = mongoose.model("CourierPartnerToken", CourierServiceSchema);
module.exports.searchKeys = [...searchKeys];
