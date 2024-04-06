const mongoose = require("mongoose");
const {
  emailType,
  ndrRtoAttemptEnum,
  smsType,
  subDispositionNDR,
} = require("../../helper/enumUtils");
const NdrDispositionSchema = new mongoose.Schema(
  {
    ndrDisposition: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    priority: {
      type: String,
      enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      default: "1",
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
        "",
        emailType.buisnessEmail,
        emailType.companyEmail,
        emailType.officialEmail,
        emailType.personalEmail,
      ],
      default: "",
    },
    rtoAttempt: {
      type: String,
      enum: [
        subDispositionNDR.cancel,
        subDispositionNDR.hold,
        subDispositionNDR.rto,
        subDispositionNDR.attempt,
        subDispositionNDR.customerWillConnect,
      ],
      required: true,
    },
    subDispositions: {
      type: [String],
      enum: [
        ndrRtoAttemptEnum.cancel,
        ndrRtoAttemptEnum.adtm,
        ndrRtoAttemptEnum.adoth,
        ndrRtoAttemptEnum.notReachable,
        ndrRtoAttemptEnum.numberBusy,
        ndrRtoAttemptEnum.ringingNoResponse,
        ndrRtoAttemptEnum.switchOff,
        ndrRtoAttemptEnum.notConnected,
        ndrRtoAttemptEnum.notInterested,
        ndrRtoAttemptEnum.callBack,
        ndrRtoAttemptEnum.other,
        ndrRtoAttemptEnum.dnc,
        ndrRtoAttemptEnum.dcFOR,
        ndrRtoAttemptEnum.dcUCR,
        ndrRtoAttemptEnum.schemeOffered,
        ndrRtoAttemptEnum.webReattempt,
      ],
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

const searchKeys = ["ndrDisposition", "subDispositions", "rtoAttempt"];
module.exports = mongoose.model("NdrDisposition", NdrDispositionSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
