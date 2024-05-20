const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const AwbMasterSchema = new mongoose.Schema(
  {
    awbNumber: { type: String, required: true, trim: true },
    isUsed: { type: Boolean, default: false },
    orderNumber: { type: Number, default: null },
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

const searchKeys = ["awbNumber", "isUsed", "orderNumber", "companyId"];
module.exports = mongoose.model("AwbMaster", AwbMasterSchema);
module.exports.searchKeys = [...searchKeys];
