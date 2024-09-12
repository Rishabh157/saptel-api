const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DealerSchema = new mongoose.Schema(
  {
    dealerCode: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    firmName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    dealerCategoryId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    creditLimit: {
      type: Number,
      required: true,
    },
    openingBalance: {
      type: Number,
      required: true,
    },
    quantityQuotient: {
      type: Number,
      required: true,
    },
    isAutoMapping: {
      type: Boolean,
      default: true,
      required: true,
    },
    isCheckCreditLimit: {
      type: Boolean,
      default: true,
      required: true,
    },
    isCheckAvailableQuotient: {
      type: Boolean,
      default: true,
      required: true,
    },
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
            trim: true,
            lowercase: true,
          },

          department: {
            type: String,
            trim: true,
            lowercase: true,
          },
          designation: {
            type: String,
            trim: true,
            lowercase: true,
          },
          email: {
            type: String,
            trim: true,
            lowercase: true,
          },
          mobileNumber: {
            type: String,
            trim: true,
          },
          maskedPhoneNo: {
            type: String,
            required: true,
          },
          landLine: {
            type: String,
            trim: true,
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
        adharCardNumber: {
          type: String,
          default: "",
        },
        adharCard: {
          type: String,
          default: "",
          trim: true,
        },
        panNumber: {
          type: String,
          default: "",
          trim: true,
        },
        panCard: {
          type: String,
          default: "",
          trim: true,
        },
      },
    },
    otherDocument: {
      type: [
        {
          documentName: {
            type: String,
            trim: true,
            default: "",
            lowercase: true,
          },
          documentFile: {
            type: String,
            default: "",
            trim: true,
          },
        },
      ],
    },
    companyId: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    zonalManagerId: {
      type: ObjectId,
      trim: true,
    },
    zonalExecutiveId: {
      type: ObjectId,
      trim: true,
    },
    zonalExecutiveAreaId: {
      type: [ObjectId],
      trim: true,
    },
    ratio: {
      type: Number,
      required: false,
      default: null,
    },
    priority: {
      type: Number,
      trim: false,
      default: null,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
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
  "creditLimit",
  "openingBalance",
  "quantityQuotient",
  "isAutoMapping",
  "isCheckCreditLimit",
  "isCheckAvailableQuotient",
  "dealerCategoryId",
  "email",
  "registrationAddress",
  "billingAddress",
  "contactInformation",
  "document",
  "otherDocument",
  "companyId",
  "zonalManagerId",
  "zonalExecutiveId",
];
module.exports = mongoose.model("Dealer", DealerSchema);
module.exports.searchKeys = [...searchKeys];
