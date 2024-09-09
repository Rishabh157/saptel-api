const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const AmazonOrderSchema = new mongoose.Schema(
  {
    companyId: { type: ObjectId, required: true, trim: true },
    orderNumber: { type: Number, required: true, trim: true },
    amazonOrderId: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseDate: { type: String, required: true, trim: true, lowercase: true },
    productName: { type: String, required: true, trim: true },
    productCode: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, trim: true },
    itemPrice: { type: Number, required: true, trim: true },
    city: { type: String, required: true, trim: true, lowercase: true },
    state: { type: String, required: true, trim: true, lowercase: true },
    pincode: { type: String, required: true, trim: true, lowercase: true },
    label: { type: String, required: true, trim: true, lowercase: true },
    status: { type: String, deault: "", trim: true, uppercase: true },
    isDispatched: { type: Boolean, deault: false },
    barcodeData: {
      type: [
        {
          barcodeId: {
            type: ObjectId,
            trim: true,
          },
          barcode: {
            type: String,
            trim: true,
          },
        },
      ],
      default: null,
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

const searchKeys = [
  "productName",
  "productCode",
  "city",
  "state",
  "pincode",
  "amazonOrderId",
  "orderNumber",
];
module.exports = mongoose.model("AmazonOrder", AmazonOrderSchema);
module.exports.searchKeys = [...searchKeys];
