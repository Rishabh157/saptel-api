const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { genderType } = require("../helper/enumUtils");
const CallSchema = new mongoose.Schema(
  {
    didNo: {
      type: String,
      required: true,
      trim: true,
    },
    inOutBound: {
      type: String,
      required: false,
      default: "",
    },
    incomingCallerNo: {
      type: String,
      required: false,
      default: "",
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryCharges: {
      type: Number,
      required: false,
      default: 0,
    },
    discount: {
      type: Number,
      required: false,
      default: 0,
    },
    total: {
      type: Number,
      required: false,
      default: 0,
    },
    countryId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    stateId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    districtId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    tehsilId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    schemeId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    pincodeId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    areaId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    expectedDeliveryDate: {
      type: String,
      required: false,
      default: "",
    },
    profileDeliveredBy: {
      type: String,
      required: false,
      default: "",
    },
    complaintDetails: {
      type: String,
      required: false,
      default: "",
    },
    complaintNo: {
      type: String,
      required: false,
      default: "",
    },
    agentName: {
      type: String,
      required: false,
      default: "",
    },
    name: {
      type: String,
      required: false,
      default: "",
    },
    age: {
      type: Number,
      required: false,
      default: 0,
    },
    address: {
      type: String,
      required: false,
      default: "",
    },
    relation: {
      type: String,
      required: true,
      trim: true,
    },
    agentDistrictId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      default: "",
      trim: true,
    },
    alternateNo1: {
      type: String,
      required: false,
      default: "",
    },
    whatsappNo: {
      type: String,
      required: false,
      default: "",
    },
    gender: {
      type: String,
      enum: [genderType.male, genderType.female, genderType.other],
      required: true,
      trim: true,
    },
    prepaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    emailId: {
      type: String,
      required: false,
      default: "",
    },
    channel: {
      type: String,
      default: "",
      trim: true,
    },
    remark: {
      type: String,
      required: false,
      default: "",
      lowercase: true,
    },
    dispositionLevelTwoId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    dispositionLevelThreeId: {
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
  "didNo",
  "inOutBound",
  "incomingCallerNo",
  "mobileNo",
  "deliveryCharges",
  "discount",
  "total",
  "countryId",
  "stateId",
  "districtId",
  "tehsilId",
  "schemeId",
  "pincodeId",
  "areaId",
  "expectedDeliveryDate",
  "profileDeliveredBy",
  "complaintDetails",
  "complaintNo",
  "agentName",
  "name",
  "age",
  "address",
  "relation",
  "agentDistrictId",
  "landmark",
  "alternateNo1",
  "whatsappNo",
  "gender",
  "prepaid",
  "emailId",
  "channel",
  "remark",
  "dispositionLevelTwoId",
  "dispositionLevelThreeId",
];
module.exports = mongoose.model("Call", CallSchema);
module.exports.searchKeys = [...searchKeys];
