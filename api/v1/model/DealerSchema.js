const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DealerSchema = new mongoose.Schema(
  {
    dealerCode: { type: String, required: true, trim: true, lowercase: true },
    firmName: { type: String, required: true, trim: true, lowercase: true },
    firstName: { type: String, required: true, trim: true, lowercase: true },
    lastName: { type: String, required: true, trim: true, lowercase: true },
    dealerCategory: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    registrationAddress: {
      type: {
        phone: {
          type: String,
          required: true,
        },

        address: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        country: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        state: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        district: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        pincode: {
          type: ObjectId,
          required: true,
          trim: true,
        },
      },
      required: true,
    },
    billingAddress: {
      type: {
        phone: {
          type: String,
          required: true,
        },

        address: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        country: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        state: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        district: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        pincode: {
          type: ObjectId,
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
            type: String,
            required: true,
          },
          landLine: {
            type: String,
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
          type: String,
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
    companyId: { type: String, required: true, trim: true },
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
