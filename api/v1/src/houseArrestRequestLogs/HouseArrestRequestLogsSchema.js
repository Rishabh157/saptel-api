const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const HouseArrestRequestLogsSchema = new mongoose.Schema(
  {
    houseArrestId: {
      type: ObjectId,
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
    ccInfoAddById: {
      type: ObjectId,
      default: null,
    },
    accoutUserId: {
      type: ObjectId,
      default: null,
    },
    managerFirstUserId: {
      type: ObjectId,
      default: null,
    },
    managerFirstApprovalDate: {
      type: String,
      default: "",
    },
    managerSecondUserId: {
      type: ObjectId,
      default: null,
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

const searchKeys = ["orderNumber", "complaintNumber"];
module.exports = mongoose.model(
  "HouseArrestRequestLogs",
  HouseArrestRequestLogsSchema
);
module.exports.searchKeys = [...searchKeys];
