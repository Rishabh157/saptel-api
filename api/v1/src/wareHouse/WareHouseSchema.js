const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const WareHouseSchema = new mongoose.Schema(
  {
    wareHouseCode: {
      type: String,
      required: true,
      trim: true,
    },
    wareHouseName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    pincodes: { type: [ObjectId], required: false, default: [] },
    country: { type: ObjectId, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
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
      },
      required: true,
    },
    contactInformation: {
      type: [
        {
          name: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
          },

          department: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
          },
          designation: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
          },
          email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
          },
          mobileNumber: {
            type: String,
            default: "",
          },
          maskedPhoneNo: {
            type: String,
            default: "",
          },
          landLine: {
            type: String,
            default: "",
          },
        },
      ],
    },
    companyId: { type: ObjectId, required: true, trim: true },
    dealerId: { type: ObjectId, default: null },
    isDefault: {
      type: Boolean,
      default: false,
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
  "registrationAddress",
  "billingAddress",
  "contactInformation",
];
module.exports = mongoose.model("WareHouse", WareHouseSchema);
module.exports.searchKeys = [...searchKeys];
