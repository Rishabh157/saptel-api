const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { orderCancelReason } = require("../../helper/enumUtils");
const OrderCancelRequestSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
      trim: true,
    },
    cancelReason: {
      type: String,
      enum: [
        orderCancelReason.wrongScheme,
        orderCancelReason.wrongPaymentMode,
        orderCancelReason.stockUnavailability,
        orderCancelReason.other,
      ],
      required: true,
    },
    remark: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    requestCreatedBy: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    cancelDate: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
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
  "orderNumber",
  "cancelReason",
  "remark",
  "requestCreatedBy",
  "cancelDate",
  "companyId",
];
module.exports = mongoose.model("OrderCancelRequest", OrderCancelRequestSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
