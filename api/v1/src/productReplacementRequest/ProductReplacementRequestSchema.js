const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ProductReplacementRequestSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
    },
    complaintNumber: {
      type: String,
      required: true,
    },
    productGroupId: {
      type: ObjectId,
      required: true,
    },
    schemeId: {
      type: ObjectId,
      required: true,
    },
    replacedSchemeId: {
      type: ObjectId,
      default: null,
    },
    replacedSchemeLabel: {
      type: String,
      default: "",
    },
    dealerId: {
      type: ObjectId,
      default: null,
    },
    wareHouseId: {
      type: ObjectId,
      default: null,
    },
    dateOfDelivery: {
      type: String,
      default: "",
    },
    requestResolveDate: {
      type: String,
      default: "",
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
    areaId: {
      type: ObjectId,
      required: true,
    },
    pincodeId: {
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
    ccRemark: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    ccApproval: {
      type: Boolean,
      default: false,
    },
    ccApprovalDate: {
      type: String,
      default: "",
    },
    accountRemark: {
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
    managerFirstRemark: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    managerFirstApproval: {
      type: Boolean,
      default: null,
    },
    managerFirstApprovalDate: {
      type: String,
      default: "",
    },
    managerSecondRemark: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    managerSecondApproval: {
      type: Boolean,
      default: null,
    },
    managerSecondApprovalDate: {
      type: String,
      default: "",
    },
    managerFirstUserId: {
      type: ObjectId,
      default: null,
    },
    managerSecondUserId: {
      type: ObjectId,
      default: null,
    },
    ccInfoAddById: {
      type: ObjectId,
      default: null,
    },
    accoutUserId: {
      type: ObjectId,
      default: null,
    },
    requestCreatedById: {
      type: ObjectId,
      required: true,
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
module.exports = mongoose.model(
  "ProductReplacementRequest",
  ProductReplacementRequestSchema
);
module.exports.searchKeys = [...searchKeys];
