const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { productStatus } = require("../../helper/enumUtils");
const DtdTransferSchema = new mongoose.Schema(
  {
    dtdNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    fromDealerId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    toDealerId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    remark: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    productDetails: {
      type: {
        productGroupId: {
          type: ObjectId,
          required: true,
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
    requestCreatedBy: { type: ObjectId, required: true, trim: true },
    requestApprovedBy: { type: ObjectId, default: null },
    requestApproved: { type: Boolean, default: null },
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

const searchKeys = ["dtdNumber", "fromDealerLabel", "toDealerLabel"];
module.exports = mongoose.model("DtdTransfer", DtdTransferSchema);
module.exports.searchKeys = [...searchKeys];
