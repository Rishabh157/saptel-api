const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    productCode: { type: String, required: true, trim: true, lowercase: true },
    productName: { type: String, required: true, trim: true, lowercase: true },
    productCategory: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    productSubCategory: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    productGroup: { type: String, required: true, trim: true, lowercase: true },
    productWeight: { type: Number, required: true, trim: true },
    dimension: {
      type: {
        height: {
          type: Number,
          required: true,
        },

        weight: {
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
    productImage: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, lowercase: true },
    item: {
      type: [
        {
          type: {
            itemName: {
              type: String,
              required: true,
              trim: true,
              lowercase: true,
            },

            itemQuantity: {
              type: Number,
              required: true,
            },
          },
        },
      ],
      required: true,
    },
    tax: {
      type: [
        {
          type: {
            taxName: {
              type: String,
              required: true,
              trim: true,
              lowercase: true,
            },

            taxPercent: {
              type: Number,
              required: true,
            },
          },
        },
      ],
      required: true,
    },
    faq: {
      type: [
        {
          type: {
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
        },
      ],
      required: true,
    },
    video: {
      type: [
        {
          type: {
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
        },
      ],
      required: true,
    },
    callScript: {
      type: [
        {
          type: {
            language: {
              type: String,
              required: true,
              trim: true,
              lowercase: true,
            },

            script: {
              type: String,
              required: true,
              trim: true,
              lowercase: true,
            },
          },
        },
      ],
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

const searchKeys = [
  "productCode",
  "productName",
  "productCategory",
  "productSubCategory",
  "productGroup",
  "productWeight",
  "dimension",
  "productImage",
  "description",
  "item",
  "tax",
  "faq",
  "video",
  "callScript",
];
module.exports = mongoose.model("Product", ProductSchema);
module.exports.searchKeys = [...searchKeys];
