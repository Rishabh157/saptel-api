const { ObjectId } = require("mongodb");

const mongoose = require("mongoose");
const {
  genderType,
  orderStatusEnum,
  paymentModeType,
  productStatus,
  firstCallDispositions,
  orderTypeEnum,
  validDealerRemark,
  dealerReasonEnum,
  preferredCourierPartner,
} = require("../../helper/enumUtils");

const OrderInquirySchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      default: null,
    },
    orderReferenceNumber: {
      type: Number,
      default: null,
    },
    orderMBKNumber: {
      type: Number,
      default: null,
    },
    inquiryNumber: {
      type: Number,
      required: true,
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
    agentId: {
      type: ObjectId,
      default: "",
    },
    agentName: {
      type: String,
      trim: true,
      default: "",
    },
    companyId: {
      type: ObjectId,
      default: "",
    },

    approved: {
      type: Boolean,
      default: "",
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
    isOrderAssigned: {
      type: Boolean,
      default: false,
    },
    batchId: {
      type: ObjectId,
      default: null,
    },
    autoFillingShippingAddress: {
      type: String,
      required: false,
      default: "",
    },
    address: { type: String, default: "" },
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
    orderInvoice: {
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
      default: "",
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
    delivery_boy_id: {
      type: ObjectId,
      default: null,
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
        orderStatusEnum.intransit,
        orderStatusEnum.deliveryOutOfNetwork,
        orderStatusEnum.ndr,
      ],
      default: orderStatusEnum.fresh,
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

    orderType: {
      type: String,
      enum: [
        orderTypeEnum.inbound,
        orderTypeEnum.website,
        orderTypeEnum.amazone,
        orderTypeEnum.customerCare,
      ],
      default: orderTypeEnum.inbound,
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

    preShipCancelationDate: {
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

    dealerReason: {
      type: String,
      enum: [
        dealerReasonEnum.deliveredSuccessfully,
        dealerReasonEnum.deliveryOutOfNetwork,
        dealerReasonEnum.pending,
        dealerReasonEnum.confirmed,
        dealerReasonEnum.callBack,
        dealerReasonEnum.holdCancel,
        dealerReasonEnum.callBackFutureConfirmed,
        dealerReasonEnum.customerNotAvailable,
        dealerReasonEnum.unclaimed,
        dealerReasonEnum.refused,
        dealerReasonEnum.intimationOnly,
        dealerReasonEnum.wrongPicodeAddressPhone,
        dealerReasonEnum.noCash,
        dealerReasonEnum.notInterested,
        dealerReasonEnum.fakeOrder,
        dealerReasonEnum.demandOpenParcel,
        dealerReasonEnum.notSatisfiedAfterOpening,
        dealerReasonEnum.notAcceptingCCC,
        dealerReasonEnum.delayDelivery,
        dealerReasonEnum.productChangeAndReassign,
        dealerReasonEnum.outOfServiceableArea,
        dealerReasonEnum.cancellationAfterShipping,
        dealerReasonEnum.rnr,
        dealerReasonEnum.personNotAvailable,
        dealerReasonEnum.damagedParcel,
        dealerReasonEnum.customerNotPickupTheCall,
        dealerReasonEnum.customerWantsToCancelTheOrder,
        dealerReasonEnum.noOrderPlaced,
        dealerReasonEnum.wrongNumber,
        dealerReasonEnum.doNotWant,
        dealerReasonEnum.nonServiceableArea,
        dealerReasonEnum.outOfAssignedArea,
        dealerReasonEnum.pickByCourier,
        "",
      ],
      default: "",
    },
    dealerFirstCaller: {
      type: ObjectId,
      default: null,
    },
    isGPO: {
      type: Boolean,
      default: false,
    },
    orderAssignedToCourier: {
      type: String,
      enum: [preferredCourierPartner.shipyaari, ""],
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
  "schemeLabel",
  "alternateNo",
  "mobileNo",
  "callType",
  "campaign",
  "paymentMode",
  "whatsappNo",
  "dispositionLevelTwoId",
  "dispositionLevelThreeId",
];

module.exports = mongoose.model("OrderInquiry", OrderInquirySchema);
module.exports.searchKeys = [...searchKeys];
