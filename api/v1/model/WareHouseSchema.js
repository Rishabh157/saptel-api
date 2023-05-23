const { ObjectId } = require("mongodb");
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
    companyId: { type: String, required: true, trim: true },
    vendorId: { type: ObjectId, default: null, trim: true },
    dealerId: { type: ObjectId, default: null, trim: true },

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
