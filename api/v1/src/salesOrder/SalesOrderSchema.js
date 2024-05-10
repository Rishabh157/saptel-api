const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { productStatus } = require("../../helper/enumUtils");
const SalesOrderSchema = new mongoose.Schema(
  {
    soNumber: {
      type: String,
      required: true,
    },
    dealerId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    dealerWareHouseId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    companyWareHouseId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    dhApprovedById: {
      type: ObjectId,
      default: null,
    },
    dhApproved: {
      type: Boolean,
      default: null,
    },
    dhApprovedActionBy: {
      type: String,
      default: "",
    },
    dhApprovedAt: {
      type: String,
      default: "",
    },
    accApprovedById: {
      type: ObjectId,
      default: null,
    },
    accApproved: {
      type: Boolean,
      default: null,
    },
    accApprovedActionBy: {
      type: String,
      default: "",
    },
    accApprovedAt: {
      type: String,
      default: "",
    },
    createdById: {
      type: ObjectId,
      default: null,
    },
    branchId: {
      type: ObjectId,
      default: null,
    },
    productSalesOrder: {
      type: {
        productGroupId: {
          type: ObjectId,
          required: true,
          trim: true,
          lowercase: true,
        },
        rate: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },

      required: true,
    },
    status: {
      type: String,
      enum: [
        productStatus.dispatched,
        productStatus.notDispatched,
        productStatus.complete,
      ],
      default: productStatus.notDispatched,
    },
    invoice: {
      type: String,
      default: "",
    },
    invoiceDate: {
      type: String,
      default: "",
    },
    invoiceNumber: {
      type: String,
      default: "",
    },
    transportnameId: {
      type: String,
      default: "",
    },

    transporterGST: {
      type: String,
      default: "",
    },
    mode: {
      type: String,
      enum: ["ROAD", "AIR"],
      default: "ROAD",
    },
    distance: {
      type: String,
      default: "",
    },
    vehicleNumber: {
      type: String,
      default: "",
    },
    vehicleType: {
      type: String,
      enum: ["REGULAR"],
      default: "REGULAR",
    },
    transportDocNo: {
      type: String,
      default: "",
    },
    documnetDate: {
      type: String,
      default: "",
    },
    roadPermitNumber: {
      type: String,
      default: "",
    },
    lrNo: {
      type: String,
      default: "",
    },
    totalWeight: {
      type: Number,
      default: null,
    },
    totalPackages: {
      type: Number,
      default: null,
    },
    fileUrl: {
      type: String,
      default: "",
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
  "soNumber",
  "dealerId",
  "dealerWareHouseId",
  "companyWareHouseId",
  "productSalesOrder",
  "dealerLabel",
  "warehouseLabel",
  "dhApprovedById",
  "accApprovedById",
];
module.exports = mongoose.model("SalesOrder", SalesOrderSchema);
module.exports.searchKeys = [...searchKeys];
