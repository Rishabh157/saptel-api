const mongoose = require("mongoose");
const AsrRequestSchema = new mongoose.Schema(
  {
    asrDetails: {
      type: [
        {
          productName: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
          },
          productId: { type: String, required: true, trim: true },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
    completed: { type: Boolean, default: false },
    companyId: { type: String, required: true, trim: true },
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
  "asrDetails.productName",
  "asrDetails.quantity",
  "completed",
];
module.exports = mongoose.model("AsrRequest", AsrRequestSchema);
module.exports.searchKeys = [...searchKeys];
