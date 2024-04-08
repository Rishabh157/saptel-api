const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { smsType, emailType } = require("../../helper/enumUtils");

const complaintDispositionSchema = mongoose.Schema(
  {
    dispositionName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    smsType: {
      type: String,
      enum: [
        smsType.alcobanSms,
        smsType.complaintCCA_CNC,
        smsType.complaintCCA_OWEI,
        smsType.complaintCCA_OWNEI,
        smsType.complaintORC,
        smsType.complaintORN,
        smsType.complaintRPIM,
        smsType.complaintRPI,
        smsType.complaintSCD,
        smsType.createComplant,
        smsType.dealerDelivered,
        smsType.dealerDeliveredBI,
        smsType.dealer_intransite,
        smsType.default,
        smsType.dhundhar,
        smsType.dispositionMsg,
        smsType.hold,
        smsType.inTransitDB,
        smsType.invoiceSent,
        smsType.nonConnect,
        smsType.orderCancellationAgentId,
        smsType.orderCancellationOutOfStock,
        smsType.orderCreation,
        smsType.orderCreationTest,
        smsType.orderDelivered,
        smsType.orderMarkedNDR,
        smsType.orderShippedCOD,
        smsType.orderShippedPrepaid,
        smsType.orderShippingSlaBreach,
        smsType.orderVerification,
        smsType.orderManualSms,
        smsType.productReceived,
        smsType.refundChequePrepared,
        smsType.refundProcessed,
        smsType.replacementOrderCreat,
        smsType.replacementOrderShipp,
        smsType.replacementProcessed,
        smsType.sendCourierDetails,
        smsType.test,
        smsType.tribeslimSms,
        smsType.urgentOrder,
      ],
      required: true,
      trim: true,
    },
    emailType: {
      type: String,
      enum: [
        emailType.buisnessEmail,
        emailType.officialEmail,
        emailType.personalEmail,
      ],
      required: true,
      trim: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
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

const searchKeys = [
  "dispositionName",
  "priority",
  "smsType",
  "emailType",
  "companyId",
];
module.exports = mongoose.model(
  "complaintDisposition",
  complaintDispositionSchema
);
module.exports.searchKeys = [...searchKeys];
