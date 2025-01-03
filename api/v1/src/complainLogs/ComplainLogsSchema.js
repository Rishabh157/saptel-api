const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const {
  complainCallTypeEnum,
  complainStatusEnum,
} = require("../../helper/enumUtils");
const ComplainLogsSchema = new mongoose.Schema(
  {
    complaintNumber: { type: Number, required: true },
    complainId: { type: ObjectId, required: true, trim: true },
    complaintById: { type: ObjectId, required: true, trim: true },
    orderNumber: { type: Number, required: true, trim: true },
    orderId: { type: ObjectId, required: true, trim: true },
    schemeId: { type: ObjectId, required: true, trim: true },
    schemeName: { type: String, required: true, trim: true },
    schemeCode: { type: String, required: true, trim: true },
    orderStatus: { type: String, required: true, trim: true },
    courierStatus: {
      type: String,
      required: true,
      trim: true,
    },
    callType: {
      type: String,
      enum: [complainCallTypeEnum.complaint, complainCallTypeEnum.inquiry],
      required: true,
      trim: true,
    },
    icOne: { type: ObjectId, required: true, trim: true },
    icTwo: { type: ObjectId, required: true, trim: true },
    icThree: { type: ObjectId, required: true, trim: true },
    icOneLabel: { type: String, required: true, trim: true },
    icTwoLabel: { type: String, required: true, trim: true },
    icThreeLabel: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: [
        complainStatusEnum.open,
        complainStatusEnum.closed,
        complainStatusEnum.pending,
      ],
      required: true,
      trim: true,
    },
    remark: { type: String, required: true, trim: true, lowercase: true },
    companyId: {
      type: ObjectId,
      required: true,
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
  "schemeName",
  "schemeCode",
  "orderStatus",
  "courierStatus",
  "callType",

  "remark",
];
module.exports = mongoose.model("ComplainLogs", ComplainLogsSchema);
module.exports.searchKeys = [...searchKeys];
