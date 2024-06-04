const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { barcodeStatusType } = require("../../helper/enumUtils");
const BarCodeSchema = new mongoose.Schema(
  {
    productGroupId: { type: ObjectId, required: true, trim: true },
    barcodeNumber: { type: String, required: true, trim: true },
    outerBoxbarCodeNumber: { type: String, default: null },
    cartonBoxId: { type: ObjectId, default: null },
    barcodeGroupNumber: { type: String, required: true, trim: true },
    lotNumber: { type: String, required: true, trim: true },
    isUsed: { type: Boolean, default: false },
    wareHouseId: { type: ObjectId, default: null, trim: true },
    vendorId: { type: ObjectId, default: null, trim: true },
    dealerId: { type: ObjectId, default: null, trim: true },
    status: {
      type: String,
      enum: [
        barcodeStatusType.atWarehouse,
        barcodeStatusType.atDealerWarehouse,
        barcodeStatusType.inTransit,
        barcodeStatusType.rtv,
        barcodeStatusType.wts,
        barcodeStatusType.wtw,
        barcodeStatusType.wtc,
        barcodeStatusType.dtw,
        barcodeStatusType.dtd,
        barcodeStatusType.delivered,
        barcodeStatusType.damage,
        barcodeStatusType.missing,
        barcodeStatusType.fake,
        barcodeStatusType.expired,
        barcodeStatusType.destroyed,
        "",
      ],
      default: "",
    },
    expiryDate: { type: String, required: true },

    companyId: { type: ObjectId, required: true, trim: true },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    isFreezed: {
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
  "productGroupId",
  "barcodeNumber",
  "productGroupLabel",
  "barcodeGroupNumber",
  "lotNumber",
];
module.exports = mongoose.model("BarCode", BarCodeSchema);
module.exports.searchKeys = [...searchKeys];
