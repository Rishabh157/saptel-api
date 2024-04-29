const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { productStatus } = require("../../helper/enumUtils");
const dtwMasterSchema = new mongoose.Schema(
  {
    dtwNumber: { type: String, required: false, trim: true },
    fromWarehouseId: { type: ObjectId, required: true },
    toWarehouseId: { type: ObjectId, required: true },
    dealerId: { type: ObjectId, required: true },
    firstApprovedById: {
      type: ObjectId,
      default: null,
    },
    firstApproved: {
      type: Boolean,
      default: null,
    },
    firstApprovedActionBy: {
      type: String,
      default: "",
    },
    firstApprovedAt: {
      type: String,
      default: "",
    },
    secondApprovedById: {
      type: ObjectId,
      default: null,
    },
    secondApproved: {
      type: Boolean,
      default: null,
    },
    secondApprovedActionBy: {
      type: String,
      default: "",
    },
    secondApprovedAt: {
      type: String,
      default: "",
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
        productStatus.notDispatched,
        productStatus.dispatched,
        productStatus.complete,
        productStatus.none,
      ],
      default: productStatus.notDispatched,
    },
    remark: { type: String, default: "", trim: true, lowercase: true },
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
  "dtwNumber",
  "fromWarehouseId",
  "toWarehouseId",
  "productGroupId",
  "remark",
];
module.exports = mongoose.model("DtwMaster", dtwMasterSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
