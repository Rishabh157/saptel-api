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
    autoMapping: {
      type: Boolean,
      default: true,
      required: true,
    },
    checkCreditLimit: {
      type: Boolean,
      default: true,
      required: true,
    },
    checkAvailableQuotient: {
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
  "creditLimit",
  "openingBalance",
  "quantityQuotient",
  "autoMapping",
  "checkCreditLimit",
  "checkAvailableQuotient",
  "dealerCategoryId",
  "email",
  "registrationAddress",
  "billingAddress",
  "contactInformation",
  "document",
  "otherDocument",
  "companyId",
];
module.exports = mongoose.model("Dealer", DealerSchema);
module.exports.searchKeys = [...searchKeys];
