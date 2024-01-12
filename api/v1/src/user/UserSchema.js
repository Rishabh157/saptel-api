// model schema starts here
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const {
  userEnum,
  userDepartmentType,
  userRoleType,
} = require("../../helper/enumUtils");
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      default: "",
      trim: true,
    },
    maskedPhoneNo: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    userDepartment: {
      type: String,
      enum: [
        userDepartmentType.salesDepartment,
        userDepartmentType.hrDepartment,
        userDepartmentType.distributionDepartment,
        userDepartmentType.financeDepartment,
        userDepartmentType.mediaDepartment,
        userDepartmentType.mediaProductionDepartment,
        userDepartmentType.ITDepartment,
        userDepartmentType.DevelopmentDepartment,
        userDepartmentType.webDepartment,
        userDepartmentType.operationDepartment,
        userDepartmentType.qualityDepartment,
        userDepartmentType.logisticDepartment,
        userDepartmentType.mappingAndMISDepartment,
        userDepartmentType.adminDepartment,
        "ADMIN",
      ],
      uppercase: true,
      required: true,
    },
    userRole: {
      type: String,
      enum: [
        userRoleType.avpSales,
        userRoleType.agmSale,
        userRoleType.managerSalesCenter,
        userRoleType.asstManagerSalesCenter,
        userRoleType.srTeamLeaderOrSrEXECUTIVEMIS,
        userRoleType.teamLeaderOrEXECUTIVESalesCenter,
        userRoleType.srEXECUTIVESalesCenter,
        userRoleType.EXECUTIVETrainee,
        userRoleType.avpHr,
        userRoleType.amgHrAndStatutoryCompliance,
        userRoleType.asstManagerHr,
        userRoleType.srEXECUTIVEHr,
        userRoleType.EXECUTIVEHr,
        userRoleType.avpDistribution,
        userRoleType.srManagerDistribution,
        userRoleType.managerArea,
        userRoleType.srEXECUTIVEArea,
        userRoleType.EXECUTIVEArea,
        userRoleType.avpFinance,
        userRoleType.agmFinance,
        userRoleType.srManagerFinance,
        userRoleType.managerFinance,
        userRoleType.amFinance,
        userRoleType.EXECUTIVEFinance,
        userRoleType.avpMedia,
        userRoleType.agmMediaPlanningAndProcurement,
        userRoleType.amMedia,
        userRoleType.EXECUTIVEMedia,
        userRoleType.avpMediaProduction,
        userRoleType.srManagerMediaProduction,
        userRoleType.srEditor,
        userRoleType.videoEditor,
        userRoleType.associateAditor,
        userRoleType.avpIT,
        userRoleType.managerSystemAndNetwork,
        userRoleType.managerServerAndIT,
        userRoleType.managerTelecomAndTechnology,
        userRoleType.amNetwork,
        userRoleType.EXECUTIVENetwork,
        userRoleType.EXECUTIVEIT,
        userRoleType.avpDevelopment,
        userRoleType.graphicDesigner,
        userRoleType.productDevelopmentAndResearch,
        userRoleType.sr3dArtist,
        userRoleType.srVFXArtist,
        userRoleType.srVisualize,
        userRoleType.avpWebDevelopment,
        userRoleType.srManagerDigitalsales,
        userRoleType.srManagerSEO,
        userRoleType.managerSEO,
        userRoleType.EXECUTIVESEO,
        userRoleType.contentCreator,
        userRoleType.contentWriter,
        userRoleType.frontendDeveloper,
        userRoleType.graphicDesignerWeb,
        userRoleType.jrWebDeveloper,
        userRoleType.srManagerDigitalSales,
        userRoleType.srWebDeveloper,
        userRoleType.webDeveloper,
        userRoleType.avpOperations,
        userRoleType.vpOperations,
        userRoleType.agmCompliance,
        userRoleType.agmOperations,
        userRoleType.avpQA,
        userRoleType.amQA,
        userRoleType.teamLeaderQualityAnalyst,
        userRoleType.EXECUTIVEQualityAnalyst,
        userRoleType.avpLogistics,
        userRoleType.managerLogistics,
        userRoleType.amLogistics,
        userRoleType.EXECUTIVELogistics,
        userRoleType.avpMapping,
        userRoleType.managerMIS,
        userRoleType.EXECUTIVEMIS,
        userRoleType.avpAdmin,
        userRoleType.managerAdmin,
        userRoleType.srEXECUTIVEAdmin,
        userRoleType.EXECUTIVEAdmin,
        "ADMIN",
      ],
      required: true,
    },
    userType: {
      type: String,
      required: true,
      default: userEnum.user,
    },
    allowedIp: {
      type: [String],
      required: true,
      default: [],
    },
    companyId: { type: ObjectId, default: null },
    branchId: { type: ObjectId, default: null },
    callCenterId: { type: ObjectId, default: null },
    floorManagerId: { type: ObjectId, default: null },
    teamLeadId: { type: ObjectId, default: null },
    isAgent: { type: Boolean, default: false },
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
  "firstName",
  "lastName",
  "mobile",
  "email",
  "userName",
  "userDepartment",
  "userRole",
  "callCenterName",
];
module.exports = mongoose.model("User", UserSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
