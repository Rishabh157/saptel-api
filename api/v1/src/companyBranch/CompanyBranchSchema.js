const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const CompanyBranchSchema = new mongoose.Schema(
  {
    branchName: { type: String, required: true, trim: true },
    companyId: { type: ObjectId, required: true, trim: true },
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

const searchKeys = ["branchName", "companyId"];
module.exports = mongoose.model("CompanyBranch", CompanyBranchSchema);
module.exports.searchKeys = [...searchKeys];
