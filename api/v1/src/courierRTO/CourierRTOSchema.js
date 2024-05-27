const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { courierRTOType } = require("../../helper/enumUtils");
const CourierRTOSchema = new mongoose.Schema(
  {
    shippingProvider: {
      type: String,
      required: true,
      trim: true,
    },
    requestStatus: {
      type: String,
      enum: [
        courierRTOType.fresh,
        courierRTOType.damage,
        courierRTOType.fake,
        courierRTOType.lost,
      ],
      required: true,
    },
    orderNumber: { type: Number, required: true },
    warehouseId: { type: ObjectId, required: true },
    companyId: { type: ObjectId, required: true },
    comment: { type: String, default: "", trim: true, lowercase: true },
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

const searchKeys = ["shippingProvider", "requestStatus", "comment"];
module.exports = mongoose.model("CourierRTO", CourierRTOSchema);
module.exports.searchKeys = [...searchKeys];
