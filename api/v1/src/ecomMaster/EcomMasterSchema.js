const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const EcomMasterSchema = new mongoose.Schema(
  {
    companyId: { type: ObjectId, required: true, trim: true },
    ecomName: { type: String, required: true, trim: true, uppercase: true },
    ecomDisplayName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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

const searchKeys = ["ecomDisplayName"];
module.exports = mongoose.model("EcomMaster", EcomMasterSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
