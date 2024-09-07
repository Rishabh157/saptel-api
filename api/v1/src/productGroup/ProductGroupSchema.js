const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ProductGroupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    productGroupCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    dealerSalePrice: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      required: false,
      default: 0,
    },
    cgst: {
      type: Number,
      required: false,
      default: 0,
    },
    sgst: {
      type: Number,
      required: false,
      default: 0,
    },
    igst: {
      type: Number,
      required: false,
      default: 0,
    },
    utgst: {
      type: Number,
      required: false,
      default: 0,
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

const searchKeys = ["groupName", "dealerSalePrice", "companyId"];
module.exports = mongoose.model("ProductGroup", ProductGroupSchema);
module.exports.searchKeys = [...searchKeys];
