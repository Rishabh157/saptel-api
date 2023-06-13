const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    productCategoryId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    productSubCategoryId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    productGroupId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    productWeight: {
      type: Number,
      required: true,
      trim: true,
    },
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
    // productImage: { type: String, required: true, trim: true },
    description: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    item: {
      type: [
        {
          itemId: {
            type: ObjectId,
            required: true,
            trim: true,
          },

          itemQuantity: {
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
    video: {
      type: [
        {
          videoName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },

          videoLink: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      required: true,
    },
    callScript: {
      type: [
        {
          language: {
            type: ObjectId,
            required: true,
            trim: true,
          },

          script: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
        },
      ],
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
  "productCode",
  "productName",
  "productCategoryId",
  "productSubCategoryId",
  "productGroupId",
  "companyId",
  "productWeight",
  "dimension",
  "description",
  "item",
  "faq",
  "video",
  "callScript",
];
module.exports = mongoose.model("Product", ProductSchema);
module.exports.searchKeys = [...searchKeys];
