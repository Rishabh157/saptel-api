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
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    countryId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    stateId: {
      type: ObjectId,
      trim: true,
    },
    districtId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    tehsilId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    schemeId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    pincodeId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    areaId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    expectedDeliveryDate: {
      type: String,
      default: "",
    },
    profileDeliveredBy: {
      type: String,
      default: "",
    },
    complaintDetails: {
      type: String,
      default: "",
    },
    complaintNo: {
      type: String,
      default: "",
    },
    agentName: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      default: "",
    },
    relation: {
      type: String,
      trim: true,
    },
    agentDistrictId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    landmark: {
      type: String,
      default: "",
      trim: true,
    },
    alternateNo1: {
      type: String,
      default: "",
    },
    whatsappNo: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: [genderType.male, genderType.female, genderType.other],
      trim: true,
    },
    prepaid: {
      type: Boolean,
      default: false,
    },
    emailId: {
      type: String,
      default: "",
    },
    channel: {
      type: String,
      default: "",
      trim: true,
    },
    remark: {
      type: String,
      default: "",
      lowercase: true,
    },
    dispositionLevelTwoId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    dispositionLevelThreeId: {
      type: ObjectId,
      trim: true,
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
