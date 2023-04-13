const mongoose = require("mongoose");
const SalesOrderSchema = new mongoose.Schema(
  {
    soNumber: { type: Number, required: true },
    dealer: { type: String, required: true, trim: true },
    wareHouse: { type: String, required: true, trim: true },
    productSalesOrder: {
      type: [
        {
          productGroup: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          rate: {
            type: Number,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
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

const searchKeys = ["soNumber", "dealer", "wareHouse", "productSalesOrder"];
module.exports = mongoose.model("SalesOrder", SalesOrderSchema);
module.exports.searchKeys = [...searchKeys];
