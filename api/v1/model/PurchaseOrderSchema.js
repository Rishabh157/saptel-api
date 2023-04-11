const mongoose = require("mongoose");
const PurchaseOrderSchema = new mongoose.Schema(
  {
    poCode: { type: String, required: true, trim: true },
    vendorId: { type: String, required: true, trim: true },
    wareHouseId: { type: String, required: true, trim: true },
    purchaseOrder: {
      type: [
        {
          itemName: {
            type: String,
            required: true,
            trim: true,
          },
          rate: {
            type: Number,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          estReceivingDate: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      required: true,
    },

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

const searchKeys = ["poCode", "vendorId", "wareHouseId", "purchaseOrder"];
module.exports = mongoose.model("PurchaseOrder", PurchaseOrderSchema);
module.exports.searchKeys = [...searchKeys];
