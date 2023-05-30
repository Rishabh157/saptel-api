const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { paymentType } = require("../helper/enumUtils");
const ChannelMasterSchema = new mongoose.Schema(
  {
    channelName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    districtId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    channelGroupId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    mobile: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    countryId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    languageId: {
      type: ObjectId,
      required: false,
      default: null,
    },
    channelCategoryId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    stateId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    paymentType: {
      type: String,
      enum: [
        paymentType.cheque,
        paymentType.netBanking,
        paymentType.cash,
        paymentType.creditCard,
        paymentType.debitCard,
      ],
      uppercase: true,
      required: true,
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
  "channelName",
  "address",
  "phone",
  "email",
  "districtId",
  "channelGroupId",
  "countryId",
  "languageId",
  "channelCategoryId",
  "stateId",
  "companyId",
  "contactPerson",
  "mobile",
  "designation",
  "website",
  "paymentType",
  "areaLabel",
  "channelGroupLabel",
  "countryLabel",
  "channelCategoryLabel",
  "stateLabel",
  "languageLabel",
];
module.exports = mongoose.model("ChannelMaster", ChannelMasterSchema);
module.exports.searchKeys = [...searchKeys];
