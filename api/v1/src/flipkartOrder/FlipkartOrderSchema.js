const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const FlipkartOrderSchema = new mongoose.Schema(
  {
    companyId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    orderNumber: { type: Number, required: true, trim: true },

    order_item_id: {
      type: String,
      required: true,
      trim: true,
    },
    order_id: {
      type: String,
      required: true,
      trim: true,
    },
    fulfilment_source: {
      type: String,
      required: true,
      trim: true,
    },
    fulfilment_type: {
      type: String,
      required: true,
      trim: true,
    },
    order_date: {
      type: String,
      required: true,
      trim: true,
    },
    order_approval_date: {
      type: String,
      required: true,
      trim: true,
    },
    order_item_status: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    fsn: {
      type: String,
      required: true,
      trim: true,
    },
    product_title: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      trim: true,
    },
    pickup_logistics_partner: {
      type: String,
      required: true,
      trim: true,
    },
    delivery_tracking_id: {
      type: String,
      required: true,
      trim: true,
    },
    forward_logistics_form: {
      type: String,
      default: "",
      trim: true,
    },
    forward_logistics_form_no: {
      type: String,
      default: "",
      trim: true,
    },
    order_cancellation_date: {
      type: String,
      default: "",
      trim: true,
    },
    cancellation_reason: {
      type: String,
      default: "",
      trim: true,
    },
    cancellation_sub_reason: {
      type: String,
      default: "",
      trim: true,
    },
    order_return_approval_date: {
      type: String,
      default: "",
      trim: true,
    },
    return_id: {
      type: String,
      default: "",
      trim: true,
    },
    return_reason: {
      type: String,
      default: "",
      trim: true,
    },
    return_sub_reason: {
      type: String,
      default: "",
      trim: true,
    },
    procurement_dispatch_sla: {
      type: String,
      default: "",
      trim: true,
    },
    dispatch_after_date: {
      type: String,
      default: "",
      trim: true,
    },
    dispatch_by_date: {
      type: String,
      default: "",
      trim: true,
    },
    order_ready_for_dispatch_on_date: {
      type: String,
      default: "",
      trim: true,
    },
    dispatched_date: {
      type: String,
      default: "",
      trim: true,
    },
    dispatch_sla_breached: {
      type: String,
      default: "",
      trim: true,
    },
    seller_pickup_reattempts: {
      type: String,
      default: "",
      trim: true,
    },
    delivery_sla: {
      type: String,
      default: "",
      trim: true,
    },
    deliver_by_date: {
      type: String,
      default: "",
      trim: true,
    },
    order_delivery_date: {
      type: String,
      default: "",
      trim: true,
    },
    delivery_sla_breached: {
      type: String,
      default: "",
      trim: true,
    },
    order_service_completion_date: {
      type: String,
      default: "",
      trim: true,
    },
    service_by_date: {
      type: String,
      default: "",
      trim: true,
    },
    service_completion_sla: {
      type: String,
      default: "",
      trim: true,
    },
    service_sla_breached: {
      type: String,
      default: "",
      trim: true,
    },
    productCode: {
      type: String,
      default: "",
      trim: true,
    },
    label: {
      type: String,
      default: "",
      trim: true,
    },
    itemPrice: { type: Number, required: true, trim: true },
    isDispatched: { type: Boolean, deault: false },

    barcodeData: {
      type: [
        {
          barcodeId: {
            type: ObjectId,
            trim: true,
          },
          barcode: {
            type: String,
            trim: true,
          },
        },
      ],
      default: null,
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

const searchKeys = [
  "order_item_id",
  "order_id",
  "product_title",
  "productCode",
  "orderNumber",
];
module.exports = mongoose.model("FlipkartOrder", FlipkartOrderSchema);
module.exports.searchKeys = [...searchKeys];
