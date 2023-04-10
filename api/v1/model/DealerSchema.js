const mongoose = require("mongoose");
const DealerSchema = new mongoose.Schema(
  {
    dealerCode: { type: String, required: true, trim: true, lowercase: true },
    firmName: { type: String, required: true, trim: true, lowercase: true },
    firstName: { type: String, required: true, trim: true, lowercase: true },
    lastName: { type: String, required: true, trim: true, lowercase: true },
    dealerCategory: {
      type: String,
      required: true,
      trim: true,
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    registrationAddress: {
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

    document: {
      type: {
        gstNumber: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        gstCertificate: {
          type: String,
          required: true,
          trim: true,
        },
        adharCardNumber: {
          type: Number,
          required: true,
        },
        adharCard: {
          type: String,
          required: true,
          trim: true,
        },
      },
      required: true,
    },
    otherDocument: {
      type: [
        {
          documentName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          documentFile: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
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
  "dealerCode",
  "firmName",
  "firstName",
  "lastName",
  "dealerCategory",
  "email",
  "registrationAddress",
  "billingAddress",
  "contactInformation",
  "document",
  "otherDocument",
];
module.exports = mongoose.model("Dealer", DealerSchema);
module.exports.searchKeys = [...searchKeys];
