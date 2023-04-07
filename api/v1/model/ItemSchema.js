const mongoose = require("mongoose");
const ItemSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, trim: true },
    itemName: { type: String, required: true, trim: true, lowercase: true },
    itemWeight: { type: Number, required: true },
    itemCategory: { type: String, required: true, trim: true },
    itemSubCategory: {
      type: String,
      required: true,
      trim: true
     
    },
    itemImage: { type: String, required: true, trim: true, lowercase: true },
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
  "itemSubCategory",
  "itemImage",
];
module.exports = mongoose.model("Item", ItemSchema);
module.exports.searchKeys = [...searchKeys];
