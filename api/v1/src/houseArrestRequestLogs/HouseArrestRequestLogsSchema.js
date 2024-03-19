const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const HouseArrestRequestLogsSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
    },
    houseArrestId: {
      type: ObjectId,
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
    mbkNumber: {
      type: Number,
      required: true,
    },
    ccApprovalDate: {
      type: String,
      default: "",
    },
    ccRemark: {
      type: String,
      default: "",
    },
    managerFirstApprovalDate: {
      type: String,
      default: "",
    },
    managerFirstRemark: {
      type: String,
      default: "",
    },
    dealerApprovalDate: {
      type: String,
      default: "",
    },
    dealerRemark: {
      type: String,
      default: "",
    },
    managerSecondApprovalDate: {
      type: String,
      default: "",
    },
    managerSecondRemark: {
      type: String,
      default: "",
    },
    accountApprovalDate: {
      type: String,
      default: "",
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

const searchKeys = ["orderNumber", "complaintNumber", "mbkNumber"];
module.exports = mongoose.model(
  "HouseArrestRequestLogs",
  HouseArrestRequestLogsSchema
);
module.exports.searchKeys = [...searchKeys];
