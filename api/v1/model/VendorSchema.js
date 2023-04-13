const mongoose = require("mongoose");
const { accountEnum } = require("../helper/enumUtils");
const VendorSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true, lowercase: true },
    vendorCode: { type: String, required: true, trim: true },
    companyType: { type: String, required: true, trim: true },
    ownerShipType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    websiteAddress: { type: String, required: true, trim: true },
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
        declarationForm: {
          type: String,
          required: true,
          trim: true,
        },
      },
      required: true,
    },
    bankInformation: {
      type: [
        {
          bankName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },

          bankBranchName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          accountHolderName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          ifscNumber: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          accountType: {
            type: String,
            enum: [accountEnum.saving, accountEnum.current],
            trim: true,
            uppercase: true,
            default: accountEnum.saving,
          },
          cancelledCheque: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
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
  "companyName",
  "vendorCode",
  "companyType",
  "ownerShipType",
  "websiteAddress",
  "registrationAddress",
  "billingAddress",
  "billingAddress",
  "contactInformation",
  "document",
  "bankInformation",
];
module.exports = mongoose.model("Vendor", VendorSchema);
module.exports.searchKeys = [...searchKeys];
