const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const SalesOrderSchema = new mongoose.Schema(
  {
    soNumber: { type: String, required: true },
    dealer: { type: ObjectId, required: true, trim: true },
    wareHouse: { type: ObjectId, required: true, trim: true },
    productSalesOrder: {
      type: {
        productGroupId: {
          type: ObjectId,
          required: true,
          trim: true,
          lowercase: true,
        },
        rate: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },

      required: true,
    },
    approval: {
      type: [
        {
          approvalLevel: {
            type: Number,
            required: true,
          },

          approvalByName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          approvalById: {
            type: ObjectId,
            required: true,
            trim: true,
          },
          time: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
        },
      ],
      default: [],
    },
    companyId: { type: ObjectId, required: true, trim: true },
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
  "soNumber",
  "dealer",
  "wareHouse",
  "productSalesOrder",
  "dealerLabel",
  "warehouseLabel",
];
module.exports = mongoose.model("SalesOrder", SalesOrderSchema);
module.exports.searchKeys = [...searchKeys];