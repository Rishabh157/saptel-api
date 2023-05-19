const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ChannelMasterSchema = new mongoose.Schema(
  {
    channelName: { type: String, required: true, trim: true, lowercase: true },
    address: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: { type: String, required: false, trim: true, default: "" },
    email: { type: String, required: false, trim: true, default: "" },
    area: { type: ObjectId, required: true, trim: true },
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
    mobile: { type: String, required: false, trim: true, default: "" },
    country: { type: ObjectId, required: true, trim: true },
    language: { type: ObjectId, required: false },
    channelCategory: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    designation: { type: String, required: false, trim: true, default: "" },
    website: { type: String, required: false, trim: true, default: "" },
    state: { type: ObjectId, required: true, trim: true },
    paymentType: { type: String, required: false, trim: true, default: "" },
    companyId: { type: ObjectId, required: true, trim: true },

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
  "area",
  "channelGroupId",
  "contactPerson",
  "mobile",
  "country",
  "language",
  "channelCategory",
  "designation",
  "website",
  "state",
  "paymentType",
];
module.exports = mongoose.model("ChannelMaster", ChannelMasterSchema);
module.exports.searchKeys = [...searchKeys];
