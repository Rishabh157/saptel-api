const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DealerPincodeSchema = new mongoose.Schema(
  {
    dealerId: { type: ObjectId, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    estTime: { type: Number, required: true, trim: true },
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

const searchKeys = ["dealerId", "pincode", "estTime", "companyId"];
module.exports = mongoose.model("DealerPincode", DealerPincodeSchema);
module.exports.searchKeys = [...searchKeys];
