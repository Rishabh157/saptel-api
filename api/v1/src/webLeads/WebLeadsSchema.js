const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const {
  webLeadStatusEnum,
  webLeadPaymentMode,
} = require("../../helper/enumUtils");

const WebLeadsSchema = new mongoose.Schema(
  {
    order_id: { type: ObjectId, default: null, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    address1: { type: String, default: "", trim: true },
    landmark: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    zip_code: { type: String, default: "", trim: true },
    quantity: { type: String, default: "", trim: true },
    remark: { type: String, default: "", trim: true },
    status: { type: String, default: "", trim: true },
    idtag: { type: String, default: "", trim: true },
    product_name: { type: String, required: true, trim: true },
    mode: {
      type: String,
      enum: [
        webLeadPaymentMode.overseas,
        webLeadPaymentMode.online,
        webLeadPaymentMode.cod,
      ],
      default: webLeadPaymentMode.cod,
      trim: true,
    },
    paymeny_mode: { type: String, default: "", trim: true },
    url: { type: String, default: "", trim: true },
    price: { type: String, default: "", trim: true },
    transactionId: { type: String, default: "", trim: true },
    leadStatus: {
      type: String,
      enum: [
        webLeadStatusEnum.pending,
        webLeadStatusEnum.complete,
        webLeadStatusEnum.inquiry,
        webLeadStatusEnum.fake,
        webLeadStatusEnum.prepaidOrder,
      ],
      default: webLeadStatusEnum.pending,
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

const searchKeys = ["phone", "email", "product_name", "leadStatus"];

module.exports = mongoose.model("WebLeads", WebLeadsSchema);
module.exports.searchKeys = [...searchKeys];
