const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const {
  genderType,
  orderStatusEnum,
  paymentModeType,
  productStatus,
  firstCallDispositions,
  validDealerRemark,
} = require("../../helper/enumUtils");
const OrderInquiryFlowSchema = new mongoose.Schema(
  {
    orderId: {
      type: ObjectId,
      required: true,
    },
    orderReferenceNumber: {
      type: Number,
      default: null,
    },
    barcodeId: {
      type: [ObjectId],
      default: [],
    },
    orderStatus: {
      type: String,
      enum: [
        productStatus.dispatched,
        productStatus.notDispatched,
        productStatus.complete,
      ],
      default: productStatus.notDispatched,
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
    batchId: {
      type: ObjectId,
      default: null,
    },
    agentId: {
      type: ObjectId,
      default: null,
    },
    agentName: {
      type: String,
      trim: true,
      default: "",
    },
    companyId: {
      type: ObjectId,
      default: null,
    },

    approved: {
      type: Boolean,
      required: true,
      default: true,
    },
    didNo: {
      type: String,
      default: "",
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
      default: "",
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

    // reciversName: {
    //   type: String,
    //   required: false,
    //   default: "",
    // },
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
    address: { type: String, default: "" },

    status: {
      type: String,
      enum: [
        orderStatusEnum.all,
        orderStatusEnum.fresh,
        orderStatusEnum.prepaid,
        orderStatusEnum.delivered,
        orderStatusEnum.doorCancelled,
        orderStatusEnum.hold,
        orderStatusEnum.psc,
        orderStatusEnum.una,
        orderStatusEnum.pnd,
        orderStatusEnum.urgent,
        orderStatusEnum.nonAction,
        orderStatusEnum.inquiry,
        orderStatusEnum.reattempt,
      ],
      default: orderStatusEnum.fresh,
    },
    orderInvoice: {
      type: String,
      required: false,
      default: "",
    },
    callCenterId: {
      type: ObjectId,
      default: null,
    },
    branchId: {
      type: ObjectId,
      default: null,
    },
    firstCallApproval: {
      type: Boolean,
      default: false,
    },
    firstCallRemark: {
      type: String,
      default: "",
    },
    firstCallCallBackDate: {
      type: String,
      default: "",
    },
    firstCallApprovedBy: {
      type: String,
      default: null,
    },
    firstCallState: {
      type: String,
      enum: [
        firstCallDispositions.cancel,
        firstCallDispositions.approved,
        firstCallDispositions.callBack,
        firstCallDispositions.languageBarrier,
        "",
      ],
      default: "",
    },
    ndrRemark: {
      type: String,
      default: "",
    },
    ndrDiscountApplicable: {
      type: Boolean,
      default: false,
    },
    ndrApprovedBy: {
      type: String,
      default: "",
    },
    dealerValidRemark: {
      type: String,
      enum: [
        validDealerRemark.correct,
        validDealerRemark.incorrect,
        validDealerRemark.notapplicable,
      ],
      default: validDealerRemark.notapplicable,
    },

    ndrCallDisposition: {
      type: ObjectId,
      default: null,
    },
    ndrRtoReattemptReason: {
      type: String,
      default: "",
    },
    latitude: {
      type: String,
      default: "",
    },
    longitude: {
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
