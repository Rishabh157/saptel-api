const mongoose = require("mongoose");
const { accountEnum, companyEnum } = require("../../helper/enumUtils");
const { ObjectId } = require("mongodb");
const VendorSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true, lowercase: true },
    vendorCode: { type: String, required: true, trim: true },
    companyType: {
      type: String,
      required: true,
      enum: [
        companyEnum.llp,
        companyEnum.opc,
        companyEnum.plc,
        companyEnum.pltc,
        companyEnum.psc,
        companyEnum.sec,
        companyEnum.sp,
      ],
      trim: true,
    },
    ownerShipType: {
      type: String,
      enum: ["PARTNERSHIP", "SINGLE"],
      required: true,
      trim: true,
    },
    websiteAddress: { type: String, required: false, default: "", trim: true },
    registrationAddress: {
      type: {
        phone: {
          type: String,
          required: true,
        },
        maskedPhoneNo: {
          type: String,
          required: true,
        },

        address: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        countryId: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        stateId: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        districtId: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        pincodeId: {
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
        maskedPhoneNo: {
          type: String,
          required: true,
        },

        address: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },
        countryId: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        stateId: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        districtId: {
          type: ObjectId,
          required: true,
          trim: true,
        },
        pincodeId: {
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
            required: false,
            trim: true,
            lowercase: true,
          },

          department: {
            type: String,
            required: false,
            trim: true,
            lowercase: true,
          },
          designation: {
            type: String,
            required: false,
            trim: true,
            lowercase: true,
          },
          email: {
            type: String,
            required: false,
            trim: true,
            lowercase: true,
          },
          mobileNumber: {
            type: String,
            required: false,
          },
          maskedPhoneNo: {
            type: String,
            required: false,
          },
          landLine: {
            type: String,
            required: false,
          },
        },
      ],
      required: true,
    },
    document: {
      type: {
        gstNumber: {
          type: String,
          default: "",
          trim: true,
        },
        gstCertificate: {
          type: String,
          default: "",
          trim: true,
        },
        declarationForm: {
          type: String,
          required: false,
          default: "",
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
          accountNumber: {
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
            required: false,
            default: "",
          },
        },
      ],
      required: true,
    },
    companyId: { type: ObjectId, required: true, trim: true },
    openingBalance: {
      type: Number,
      default: 0,
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
  "openingBalance",
];
module.exports = mongoose.model("Vendor", VendorSchema);
module.exports.searchKeys = [...searchKeys];
