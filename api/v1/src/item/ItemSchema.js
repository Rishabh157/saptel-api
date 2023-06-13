const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const ItemSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, trim: true },
    itemName: { type: String, required: true, trim: true, lowercase: true },
    itemWeight: { type: Number, required: true },
    // itemImage: { type: String, required: true, trim: true, lowercase: true },
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

const searchKeys = [
  "itemCode",
  "itemName",
  "itemWeight",
  "itemCategory",
  // "itemImage",
];
module.exports = mongoose.model("Item", ItemSchema);
module.exports.searchKeys = [...searchKeys];
