const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const SchemeSchema = new mongoose.Schema(
  {
    schemeCode: { type: String, required: true, trim: true },
    schemeName: { type: String, required: true, trim: true, lowercase: true },
    category: { type: ObjectId, required: true, trim: true, lowercase: true },
    subCategory: {
      type: ObjectId,
      required: true,
      trim: true,
      lowercase: true,
    },
    schemePrice: { type: Number, required: true },
    commission: { type: Number, required: true },
    dimension: {
      type: {
        height: {
          type: Number,
          required: true,
        },

        width: {
          type: Number,
          required: true,
        },

        depth: {
          type: Number,
          required: true,
        },
      },

      required: true,
    },

    weight: { type: Number, required: true },
    deliveryCharges: { type: Number, required: true },
    comboPacking: { type: Boolean, required: true },
    startDate: { type: String, required: true, trim: true, lowercase: true },
    endDate: { type: String, required: true, trim: true, lowercase: true },
    schemeDescription: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    productInformation: {
      type: [
        {
          productGroup: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },

          productQuantity: {
            type: Number,
            required: true,
          },
          mrp: {
            type: Number,
            required: true,
          },
          pop: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
    faq: {
      type: [
        {
          question: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },

          answer: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
        },
      ],
      required: true,
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

const searchKeys = [
  "schemeCode",
  "schemeName",
  "category",
  "subCategory",
  "schemePrice",
  "dimension",
  "weight",
  "deliveryCharges",
  "comboPacking",
  "startDate",
  "enddate",
  "schemeDescription",
  "productInformation",
  "faq",
];
module.exports = mongoose.model("Scheme", SchemeSchema);
module.exports.searchKeys = [...searchKeys];
