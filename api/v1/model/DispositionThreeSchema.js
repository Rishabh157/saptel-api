const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const {
  smsType,
  emailType,
  applicableCriteria,
} = require("../helper/enumUtils");

const DispositionThreeSchema = new mongoose.Schema(
  {
    dispositionName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    dispositionOneId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    dispositionTwoId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    companyId: {
      type: ObjectId,
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
        smsType.complaintRPI,
        smsType.complaintRPIM,
        smsType.complaintSCD,
        smsType.createComplant,
        smsType.dealerDelivered,
        smsType.dealerDeliveredBI,
        smsType.dispositionMsg,
        smsType.hold,
        smsType.inTransitDB,
        smsType.invoiceSent,
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
    applicableCriteria: {
      type: [String],
      enum: [
        applicableCriteria.isOrder,
        applicableCriteria.isPrepaid,
        applicableCriteria.isCallBack,
        applicableCriteria.isReplacement,
      ],
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
  "dispositionOneId",
  "dispositionTwoId",
  "companyId",
  "smsType",
  "emailType",
  "priority",
  "applicableCriteria",
];
module.exports = mongoose.model("DispositionThree", DispositionThreeSchema);
module.exports.searchKeys = [...searchKeys];
