// model schema starts here
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { userEnum, userDepartmentType } = require("../../helper/enumUtils");
const UserSchema = new mongoose.Schema(
  {
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
    mobile: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
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
    },
    // userDepartment: {
    //   type: String,
    //   enum: [
    //     userDepartmentType.salesDepartment,
    //     userDepartmentType.hrDepartment,
    //     userDepartmentType.distributionDepartment,
    //     userDepartmentType.financeDepartment,
    //     userDepartmentType.mediaDepartment,
    //     userDepartmentType.mediaProductionDepartment,
    //     userDepartmentType.ITDepartment,
    //     userDepartmentType.DevelopmentDepartment,
    //     userDepartmentType.webDepartment,
    //     userDepartmentType.operationDepartment,
    //     userDepartmentType.qualityDepartment,
    //     userDepartmentType.logisticDepartment,
    //     userDepartmentType.mappingAndMISDepartment,
    //     userDepartmentType.adminDepartment,
    //   ],
    //   uppercase: true,
    //   required: true,
    // },
    // userRole: {
    //   type: String,
    //   enum: [],
    //   required: true,
    // },
    userType: {
      type: String,
      required: true,
      default: userEnum.user,
    },
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

const searchKeys = ["firstName", "lastName", "mobile", "email"];
module.exports = mongoose.model("User", UserSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
