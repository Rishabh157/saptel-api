const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const PurchaseOrderSchema = new mongoose.Schema(
  {
    poCode: { type: String, required: true, trim: true },
    vendorId: { type: ObjectId, required: true, trim: true },
    wareHouseId: { type: ObjectId, required: true, trim: true },
    purchaseOrder: {
      type: {
        itemId: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        rate: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        estReceivingDate: {
          type: String,
          required: true,
          trim: true,
        },
      },

      required: true,
    },
    isEditable: {
      type: Boolean,
      default: true,
    },

    approval: {
      type: [
        {
          approvalLevel: {
            type: Number,
            required: true,
          },

          approvalByName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          approvalById: {
            type: ObjectId,
            required: true,
          },
          time: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
        },
      ],
      default: [],
    },
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

const searchKeys = ["poCode", "vendorId", "wareHouseId", "purchaseOrder"];
module.exports = mongoose.model("PurchaseOrder", PurchaseOrderSchema);
module.exports.searchKeys = [...searchKeys];
