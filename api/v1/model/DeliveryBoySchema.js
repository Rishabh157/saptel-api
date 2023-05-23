const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DeliveryBoySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true, trim: true, lowercase: true },
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

const searchKeys = ["name", "mobile", "password"];
module.exports = mongoose.model("DeliveryBoy", DeliveryBoySchema);
module.exports.searchKeys = [...searchKeys];
