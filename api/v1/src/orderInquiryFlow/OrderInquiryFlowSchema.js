const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { orderStatusEnum } = require("../../helper/enumUtils");
const OrderInquiryFlowSchema = new mongoose.Schema(
  {
    orderId: {
      type: ObjectId,
      required: true,
    },
    orderReferenceNumber: {
      type: Number,
      default: null,
    },

    remark: {
      type: String,

      default: "",
    },

    status: {
      type: String,
      enum: [
        orderStatusEnum.all,
        orderStatusEnum.fresh,
        orderStatusEnum.prepaid,
        orderStatusEnum.delivered,
        orderStatusEnum.doorCancelled,
        orderStatusEnum.hold,
        orderStatusEnum.psc,
        orderStatusEnum.una,
        orderStatusEnum.pnd,
        orderStatusEnum.urgent,
        orderStatusEnum.nonAction,
        orderStatusEnum.inquiry,
        orderStatusEnum.reattempt,
        orderStatusEnum.intransit,
        orderStatusEnum.deliveryOutOfNetwork,
        orderStatusEnum.ndr,
        orderStatusEnum.closed,
        orderStatusEnum.cancel,
        orderStatusEnum.rto,
      ],
      default: orderStatusEnum.fresh,
    },

    createdBy: {
      type: String,
      default: "",
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

const searchKeys = ["status", "alternateNo"];
module.exports = mongoose.model("OrderInquiryFlow", OrderInquiryFlowSchema);
module.exports.searchKeys = [...searchKeys];
