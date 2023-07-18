const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const SalesOrderSchema = new mongoose.Schema(
  {
    soNumber: {
      type: String,
      required: true,
    },
    dealerId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    dealerWareHouseId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    companyWareHouseId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    dhApprovedById: {
      type: ObjectId,
      default: null,
    },
    dhApproved: {
      type: Boolean,
      default: null,
    },
    dhApprovedActionBy: {
      type: String,
      default: "",
    },
    dhApprovedAt: {
      type: String,
      default: "",
    },
    accApprovedById: {
      type: ObjectId,
      default: null,
    },
    accApproved: {
      type: Boolean,
      default: null,
    },
    accApprovedActionBy: {
      type: String,
      default: "",
    },
    accApprovedAt: {
      type: String,
      default: "",
    },
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

    companyId: {
      type: ObjectId,
      required: true,
      trim: true,
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
  "soNumber",
  "dealerId",
  "dealerWareHouseId",
  "companyWareHouseId",
  "productSalesOrder",
  "dealerLabel",
  "warehouseLabel",
  "dhApprovedById",
  "accApprovedById",
];
module.exports = mongoose.model("SalesOrder", SalesOrderSchema);
module.exports.searchKeys = [...searchKeys];
