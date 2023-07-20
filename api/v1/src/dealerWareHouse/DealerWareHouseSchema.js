const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DealerWareHouseSchema = new mongoose.Schema(
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
    country: { type: ObjectId, required: true, trim: true },
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
        gstNumber: {
          type: String,
          required: true,
          trim: true,
        },
        gstCertificate: {
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
            required: false,
            trim: true,
            default: "",
          },

          department: {
            type: String,
            required: false,
            trim: true,
            default: "",
          },
          designation: {
            type: String,
            required: false,
            trim: true,
            default: "",
          },
          email: {
            type: String,
            required: false,
            trim: true,
            default: "",
          },
          mobileNumber: {
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
    companyId: { type: ObjectId, required: true, trim: true },
    // vendorId: { type: ObjectId, default: null, trim: true },
    dealerId: { type: ObjectId, required: true },

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
module.exports = mongoose.model("DealerWareHouse", DealerWareHouseSchema);
module.exports.searchKeys = [...searchKeys];
