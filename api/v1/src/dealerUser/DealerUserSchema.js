const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DealerUserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    dealerId: {
      type: ObjectId,
      required: true,
      trim: true,
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
  "userName",
  "email",
  "mobileNo",
  "password",
  "dealerId",
  "companyId",
];
module.exports = mongoose.model("DealerUser", DealerUserSchema);
module.exports.searchKeys = [...searchKeys];
