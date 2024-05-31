const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { customerReturnRequestType } = require("../../helper/enumUtils");
const CustomerWHReturnSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
      trim: true,
    },
    schemeName: {
      type: String,
      required: true,
      trim: true,
    },
    schemeQuantity: {
      type: Number,
      required: true,
      trim: true,
    },
    requestType: {
      type: String,
      enum: [
        customerReturnRequestType.moneyBack,
        customerReturnRequestType.replacement,
        customerReturnRequestType.houseArrest,
      ],
      trim: true,
    },
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
    },
    productInfo: {
      type: [
        {
          productGroupName: {
            type: String,
            trim: true,
          },
          quantity: {
            type: Number,
            trim: true,
          },
        },
      ],
    },
    ccRemark: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    warehouseId: {
      type: ObjectId,
      required: false,
      trim: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
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

const searchKeys = ["orderNumber", "requestStatus", "ccRemark", "requestType"];
module.exports = mongoose.model("CustomerWHReturn", CustomerWHReturnSchema);
module.exports.searchKeys = [...searchKeys];
