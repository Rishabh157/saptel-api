const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const { accountEnum } = require("../../helper/enumUtils");
const CompanySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true, lowercase: true },
    companyCode: { type: String, required: true, trim: true, uppercase: true },
    websiteUrl: { type: String, required: false, trim: true },
    companyLogo: { type: String, required: false, trim: true },
    gstNo: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true, lowercase: true },
    phoneNo: { type: String, required: false, trim: true },
    maskedPhoneNo: {
      type: String,
      required: true,
    },
    bankDetails: {
      type: [
        {
          bankName: {
            type: String,
            default: "",
            trim: true,
          },
          branchName: {
            type: String,
            default: "",
            trim: true,
          },
          accountHolderName: {
            type: String,
            default: "",
            trim: true,
          },
          accountNumber: { type: Number, default: "" },
          ifscNumber: {
            type: String,
            default: "",
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
  "companyName",
  "websiteUrl",
  "companyLogo",
  "gstNo",
  "address",
  "phoneNo",
  "bankName",
  "branchName",
  "accountHolderName",
  "accountNumber",
  "ifscNumber",
  "accountType",
];
module.exports = mongoose.model("Company", CompanySchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
