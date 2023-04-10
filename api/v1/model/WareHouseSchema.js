const mongoose = require("mongoose");
const WareHouseSchema = new mongoose.Schema(
  {
    wareHouseCode: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    wareHouseName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    country: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    regd: {
      type: {
        phone: {
          type: Number,
          required: true,
        },

        address: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        country: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        district: {
          type: String,
          required: true,
          trim: true,
        },
        pincode: {
          type: String,
          required: true,
          trim: true,
        },
      },
      required: true,
    },
    billingAddress: {
      type: {
        phone: {
          type: Number,
          required: true,
        },

        address: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        country: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        district: {
          type: String,
          required: true,
          trim: true,
        },
        pincode: {
          type: String,
          required: true,
          trim: true,
        },
      },
      required: true,
    },
    contactInformation: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },

          department: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          designation: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          mobileNumber: {
            type: Number,
            required: true,
          },
          landLine: {
            type: Number,
            required: true,
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
  "wareHouseCode",
  "wareHouseName",
  "country",
  "email",
  "regd",
  "billingAddress",
  "contactInformation",
];
module.exports = mongoose.model("WareHouse", WareHouseSchema);
module.exports.searchKeys = [...searchKeys];
