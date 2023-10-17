const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { productStatus } = require("../../helper/enumUtils");
const RtvMasterSchema = new mongoose.Schema(
  {
    rtvNumber: { type: String, required: false, trim: true, lowercase: true },
    vendorId: { type: ObjectId, required: true, trim: true },
    warehouseId: { type: ObjectId, required: true, trim: true },
    firstApprovedById: {
      type: ObjectId,
      default: null,
    },
    firstApproved: {
      type: Boolean,
      default: null,
    },
    firstApprovedActionBy: {
      type: String,
      default: "",
    },
    firstApprovedAt: {
      type: String,
      default: "",
    },
    secondApprovedById: {
      type: ObjectId,
      default: null,
    },
    secondApproved: {
      type: Boolean,
      default: null,
    },
    secondApprovedActionBy: {
      type: String,
      default: "",
    },
    secondApprovedAt: {
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
    remark: { type: String, required: false, trim: true, lowercase: true },
    status: {
      type: String,
      enum: [
        productStatus.notDispatched,
        productStatus.dispatched,
        productStatus.complete,
        productStatus.none,
      ],
      default: productStatus.notDispatched,
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
  "rtvNumber",
  "vendorId",
  "warehouseId",
  "productGroupId",
  "quantity",
  "remark",
];
module.exports = mongoose.model("RtvMaster", RtvMasterSchema);
module.exports.searchKeys = [...searchKeys];
