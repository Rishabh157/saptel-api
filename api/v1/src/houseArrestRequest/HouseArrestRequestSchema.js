const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const HouseArrestRequestSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
    },
    mbkNumber: {
      type: Number,
      required: true,
    },
    complaintNumber: {
      type: String,
      required: true,
    },
    requestCreatedBy: {
      type: ObjectId,
      required: true,
    },
    requestCreatedByRemark: {
      type: String,
      required: true,
    },
    schemeId: {
      type: ObjectId,
      required: true,
    },
    dealerId: {
      type: ObjectId,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    stateId: {
      type: ObjectId,
      required: true,
    },
    districtId: {
      type: ObjectId,
      required: true,
    },
    tehsilId: {
      type: ObjectId,
      required: true,
    },
    pincodeId: {
      type: ObjectId,
      required: true,
    },
    areaId: {
      type: ObjectId,
      required: true,
    },
    customerNumber: {
      type: String,
      required: true,
    },
    alternateNumber: {
      type: String,
      default: "",
    },
    ccApproval: {
      type: Boolean,
      default: null,
    },
    ccApprovalDate: {
      type: String,
      default: "",
    },
    ccRemark: {
      type: String,
      default: "",

      trim: true,
      lowercase: true,
    },
    setteldAmount: {
      type: String,
      default: "",
    },
    managerFirstApproval: {
      type: Boolean,
      default: null,
    },
    managerFirstApprovalDate: {
      type: String,
      default: "",
    },
    managerFirstRemark: {
      type: String,
      default: "",

      trim: true,
      lowercase: true,
    },
    dealerApproval: {
      type: Boolean,
      default: null,
    },
    dealerApprovalDate: {
      type: String,
      default: "",
    },
    dealerRemark: {
      type: String,
      default: "",

      trim: true,
      lowercase: true,
    },
    returnItemBarcode: {
      type: String,
      default: "",
    },
    managerSecondApproval: {
      type: Boolean,
      default: null,
    },
    managerSecondApprovalDate: {
      type: String,
      default: "",
    },
    managerSecondRemark: {
      type: String,
      default: "",

      trim: true,
      lowercase: true,
    },
    accountApproval: {
      type: Boolean,
      default: null,
    },
    accountApprovalDate: {
      type: String,
      default: "",
    },
    requestResolveDate: {
      type: String,
      default: "",
    },
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

const searchKeys = ["orderNumber", "complaintNumber"];
module.exports = mongoose.model("HouseArrestRequest", HouseArrestRequestSchema);
module.exports.searchKeys = [...searchKeys];
