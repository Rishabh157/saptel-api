const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { complaintType, smsType, emailType } = require("../../helper/enumUtils");
const InitialCallThreeSchema = new mongoose.Schema(
  {
    callType: {
      type: String,
      enum: [
        complaintType.complaint,
        complaintType.inquiry,
        complaintType.feedback,
      ],
      required: true,
    },

    emailType: {
      type: String,
      enum: [
        emailType.buisnessEmail,
        emailType.officialEmail,
        emailType.personalEmail,
        emailType.companyEmail,
      ],
      required: true,
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
    returnType: {
      type: [String],
      enum: ["ESCALATE", "REPLACEMENT", "REFUND"],
      required: true,
    },
    isPnd: {
      type: Boolean,

      default: false,
    },
    cancelFlag: {
      type: Boolean,

      default: false,
    },
    initialCallName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    initialCallDisplayName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    initialCallOneId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    initialCallTwoId: {
      type: ObjectId,
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
  "initialCallName",
  "initialCallOneId",
  "initialCallTwoId",
  "companyId",

  "emailType",
  "smsType",
  "returnType",
  "callType",
];
module.exports = mongoose.model("InitialCallThree", InitialCallThreeSchema);
module.exports.searchKeys = [...searchKeys];
