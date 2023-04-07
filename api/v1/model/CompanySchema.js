const mongoose = require("mongoose");
const CompanySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true, lowercase: true },
    websiteUrl: { type: String, required: false, trim: true },
    companyLogo: { type: String, required: false, trim: true },
    gstNo: { type: String, required: false, trim: true },
    address: { type: String, required: true, trim: true, lowercase: true },
    phoneNo: { type: String, required: false, trim: true },
    bankDetails: {
      type: [
        {
          bankName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          branchName: {
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
          accountNumber: { type: Number, required: true },
          ifscNumber: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
          },
          accountType: {
            type: String,
            enum: ["SAVING", "CURRENT"],
            trim: true,
            uppercase: true,
            default: "SAVING",
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
