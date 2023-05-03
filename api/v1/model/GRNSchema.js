const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const GoodReceivedNoteSchema = new mongoose.Schema(
  {
    poCode: { type: String, required: true, trim: true, lowercase: true },
    itemId: { type: ObjectId, required: true, trim: true, lowercase: true },
    receivedQuantity: { type: Number, required: true, trim: true },
    goodQuantity: { type: Number, required: true, trim: true },
    defectiveQuantity: { type: Number, required: true, trim: true },
    companyId: { type: ObjectId, required: true },
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
  "poCode",
  "receivedQuantity ",
  "goodQuantity",
  "defectiveQuantity",
];
module.exports = mongoose.model("GoodReceivedNote", GoodReceivedNoteSchema);
module.exports.searchKeys = [...searchKeys];
