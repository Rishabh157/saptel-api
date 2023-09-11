const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const {
  genderType,
  orderType,
  paymentModeType,
} = require("../../helper/enumUtils");
const OrderInquiryFlowSchema = new mongoose.Schema(
  {
    orderId: {
      type: ObjectId,
      required: true,
    },
    assignDealerId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    assignWarehouseId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    agentId: {
      type: ObjectId,
      required: true,
    },
    agentName: {
      type: String,
      trim: true,
      required: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
    },

    approved: {
      type: Boolean,
      required: true,
      default: true,
    },
    didNo: {
      type: String,
      required: true,
      trim: true,
    },
    ageGroup: {
      type: String,
      required: false,
      default: "",
    },
    alternateNo: {
      type: String,
      required: false,
      default: "",
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },

    autoFillingShippingAddress: {
      type: String,
      required: false,
      default: "",
    },
    callType: {
      type: String,
      required: false,
      default: "",
    },
    campaign: {
      type: String,
      required: false,
      default: "",
    },
    customerName: {
      type: String,
      required: false,
      default: "",
    },
    deliveryTimeAndDate: {
      type: String,
      required: false,
      default: "",
    },

    countryId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    stateId: {
      type: ObjectId,
      trim: true,
    },
    districtId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    tehsilId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    schemeId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    schemeName: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    pincodeId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    pincodeSecondId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    areaId: {
      type: ObjectId,
      trim: true,
      default: null,
    },

    emailId: {
      type: String,
      required: false,
      default: "",
    },

    flagStatus: {
      type: String,
      required: false,
      default: "",
    },
    gender: {
      type: String,
      enum: [genderType.male, genderType.female, genderType.other],
      trim: true,
    },
    houseNumber: {
      type: String,
      required: false,
      default: "",
    },
    incomingCallerNo: {
      type: String,
      required: false,
      default: "",
    },
    landmark: {
      type: String,
      required: false,
      default: "",
    },
    medicalIssue: {
      type: [String],
      required: false,
      default: [""],
    },

    orderFor: {
      type: [String],
      required: false,
      default: "",
    },
    orderForOther: {
      type: String,
      required: false,
      default: "",
    },
    paymentMode: {
      type: String,
      enum: [paymentModeType.COD, paymentModeType.UPI_ONLINE, ""],
      required: false,
      default: "",
    },

    productGroupId: {
      type: ObjectId,
      trim: true,
      default: null,
    },

    reciversName: {
      type: String,
      required: false,
      default: "",
    },
    remark: {
      type: String,
      required: false,
      default: "",
    },
    shcemeQuantity: {
      type: Number,
      required: false,
      default: 1,
    },
    socialMedia: {
      type: {
        facebook: {
          type: String,
          required: false,
          default: "",
        },

        instagram: {
          type: String,
          required: false,
          default: "",
        },
      },
      required: false,
    },
    streetNumber: {
      type: String,
      required: false,
      default: "",
    },
    typeOfAddress: {
      type: String,
      required: false,
      default: "",
    },
    whatsappNo: {
      type: String,
      required: false,
      default: "",
    },
    price: {
      type: Number,
      required: false,
      default: 0,
    },
    deliveryCharges: {
      type: Number,
      required: false,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: false,
      default: 0,
    },

    dispositionLevelTwoId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    dispositionLevelThreeId: {
      type: ObjectId,
      trim: true,
      default: null,
    },
    preffered_delivery_start_time: {
      type: String,
      required: false,
      default: "",
    },
    preffered_delivery_end_time: {
      type: String,
      required: false,
      default: "",
    },
    preffered_delivery_date: {
      type: String,
      required: false,
      default: "",
    },
    recordingStartTime: {
      type: String,
      default: "",
    },
    recordingEndTime: {
      type: String,
      default: "",
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
  "didNo",
  "alternateNo",
  "mobileNo",
  "callType",
  "campaign",
  "paymentMode",
  "whatsappNo",
  "dispositionLevelTwoId",
  "dispositionLevelThreeId",
];
module.exports = mongoose.model("OrderInquiryFlow", OrderInquiryFlowSchema);
module.exports.searchKeys = [...searchKeys];