const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const WebLeadsSchema = new mongoose.Schema(
  {
    order_id: { type: ObjectId, required: false, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: false, trim: true },
    address: { type: String, required: false, trim: true },
    address1: { type: String, required: false, trim: true },
    landmark: { type: String, required: false, trim: true },
    city: { type: String, required: false, trim: true },
    state: { type: String, required: false, trim: true },
    country: { type: String, required: false, trim: true },
    zip_code: { type: String, required: false, trim: true },
    quantity: { type: String, required: false, trim: true },
    remark: { type: String, required: false, trim: true },
    sdate: { type: String, required: false, trim: true },
    status: { type: String, required: false, trim: true },
    idtag: { type: String, required: false, trim: true },
    product_name: { type: String, required: true, trim: true },
    mode: { type: String, required: false, trim: true },
    paymeny_mode: { type: String, required: false, trim: true },
    url: { type: String, required: false, trim: true },
    price: { type: String, required: false, trim: true },
    leadStatus: { type: String, required: false, trim: true },
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
  "phone",
  "email",
  "product_name",
  "leadStatus"
];

module.exports = mongoose.model("WebLeads", WebLeadsSchema);
module.exports.searchKeys = [...searchKeys];
