const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");
const { orderStatusEnum, courierRTOType } = require("../../helper/enumUtils");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    orderNumber: Joi.number().required(),
    approved: Joi.boolean().required(),
    didNo: Joi.string().allow(""),
    agentId: Joi.string().custom(commonValidation.objectId).required(),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
    agentName: Joi.string().required(),
    ageGroup: Joi.string().allow(""),
    mobileNo: Joi.string().required(),
    alternateNo: Joi.string().allow(""),
    autoFillingShippingAddress: Joi.string().allow(""),

    callType: Joi.string().allow(""),
    campaign: Joi.string().allow(""),
    customerName: Joi.string().allow(""),
    deliveryTimeAndDate: Joi.string().allow(""),
    countryId: Joi.string().custom(commonValidation.objectId).allow(null),
    stateId: Joi.string().custom(commonValidation.objectId).allow(null),
    districtId: Joi.string().custom(commonValidation.objectId).allow(null),
    tehsilId: Joi.string().custom(commonValidation.objectId).allow(null),
    schemeId: Joi.string().custom(commonValidation.objectId).allow(null),
    schemeName: Joi.string().allow(""),

    pincodeId: Joi.string().custom(commonValidation.objectId).allow(null),
    pincodeSecondId: Joi.string().custom(commonValidation.objectId).allow(null),
    areaId: Joi.string().custom(commonValidation.objectId).allow(null),
    emailId: Joi.string().allow(""),
    flagStatus: Joi.string().allow(""),
    gender: Joi.string().allow(""),
    houseNumber: Joi.string().allow(""),
    incomingCallerNo: Joi.string().allow(""),
    landmark: Joi.string().allow(""),
    medicalIssue: Joi.array().items(Joi.string()).default([]),

    orderFor: Joi.array().items(Joi.string()).default([]),
    orderForOther: Joi.string().allow(""),
    paymentMode: Joi.string().allow(""),
    productGroupId: Joi.string().custom(commonValidation.objectId).allow(null),
    // reciversName: Joi.string().allow(""),
    remark: Joi.string().allow(""),
    shcemeQuantity: Joi.number().custom(commonValidation.minValue),
    socialMedia: Joi.object().keys({
      facebook: Joi.string().allow(""),
      instagram: Joi.string().allow(""),
    }),
    streetNumber: Joi.string().allow(""),
    typeOfAddress: Joi.string().allow(""),
    whatsappNo: Joi.string().allow(""),
    price: Joi.number(),
    deliveryCharges: Joi.number(),
    totalAmount: Joi.number(),
    dispositionLevelTwoId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    dispositionLevelThreeId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    assignDealerId: Joi.string().custom(commonValidation.objectId).allow(null),
    assignWarehouseId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    preffered_delivery_start_time: Joi.string().allow(""),
    preffered_delivery_end_time: Joi.string().allow(""),
    preffered_delivery_date: Joi.string().allow(""),
    recordingStartTime: Joi.string().allow(""),
    recordingEndTime: Joi.string().allow(""),
    status: Joi.string().required(""),
    callCenterId: Joi.string().custom(commonValidation.objectId).allow(null),
    branchId: Joi.string().custom(commonValidation.objectId).allow(null),
  }),
};

/**
 * update existing document
 */
const update = {
  params: Joi.object().keys({
    id: Joi.required().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    barcodeId: Joi.string().custom(commonValidation.objectId).allow(null),
    orderStatus: Joi.string().required(),
    orderNumber: Joi.number().required(),
    approved: Joi.boolean().required(),
    didNo: Joi.string().allow(""),
    agentId: Joi.string().custom(commonValidation.objectId).required(),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
    agentName: Joi.string().required(),
    ageGroup: Joi.string().allow(""),
    mobileNo: Joi.string().required(),
    alternateNo: Joi.string().allow(""),
    autoFillingShippingAddress: Joi.string().allow(""),

    callType: Joi.string().allow(""),
    campaign: Joi.string().allow(""),
    customerName: Joi.string().allow(""),
    deliveryTimeAndDate: Joi.string().allow(""),
    countryId: Joi.string().custom(commonValidation.objectId).allow(null),
    stateId: Joi.string().custom(commonValidation.objectId).allow(null),
    districtId: Joi.string().custom(commonValidation.objectId).allow(null),
    tehsilId: Joi.string().custom(commonValidation.objectId).allow(null),
    schemeId: Joi.string().custom(commonValidation.objectId).allow(null),
    schemeName: Joi.string().allow(""),

    pincodeId: Joi.string().custom(commonValidation.objectId).allow(null),
    pincodeSecondId: Joi.string().custom(commonValidation.objectId).allow(null),
    areaId: Joi.string().custom(commonValidation.objectId).allow(null),
    emailId: Joi.string().allow(""),
    flagStatus: Joi.string().allow(""),
    gender: Joi.string().allow(""),
    houseNumber: Joi.string().allow(""),
    incomingCallerNo: Joi.string().allow(""),
    landmark: Joi.string().allow(""),
    medicalIssue: Joi.array().items(Joi.string()).default([]),
    orderFor: Joi.array().items(Joi.string()).default([]),
    orderForOther: Joi.string().allow(""),
    paymentMode: Joi.string().allow(""),
    productGroupId: Joi.string().custom(commonValidation.objectId).allow(null),
    // reciversName: Joi.string().allow(""),
    remark: Joi.string().allow(""),
    shcemeQuantity: Joi.number().custom(commonValidation.minValue),
    socialMedia: Joi.object().keys({
      facebook: Joi.string().allow(""),
      instagram: Joi.string().allow(""),
    }),
    streetNumber: Joi.string().allow(""),
    typeOfAddress: Joi.string().allow(""),
    whatsappNo: Joi.string().allow(""),
    price: Joi.number(),
    deliveryCharges: Joi.number(),
    totalAmount: Joi.number(),
    dispositionLevelTwoId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    dispositionLevelThreeId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    assignDealerId: Joi.string().custom(commonValidation.objectId).allow(null),
    assignWarehouseId: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    preffered_delivery_start_time: Joi.string().allow(""),
    preffered_delivery_end_time: Joi.string().allow(""),
    preffered_delivery_date: Joi.string().allow(""),
    recordingStartTime: Joi.string().allow(""),
    recordingEndTime: Joi.string().allow(""),
    status: Joi.string().required(""),
    callCenterId: Joi.string().custom(commonValidation.objectId).allow(null),
    branchId: Joi.string().custom(commonValidation.objectId).allow(null),
  }),
};

const getGlobalSearch = {
  body: Joi.object().keys({
    orderNumber: Joi.string().optional(),
    phoneNumber: Joi.string().allow(""),
  }),
};

/**
 * filter and pagination api
 */
const getAllFilter = {
  body: Joi.object().keys({
    params: Joi.array().items(Joi.string().required()),
    searchValue: Joi.string().allow(""),
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string()
          // .custom(commonValidation.dateFormatWithTime)
          .allow(""),
        endDate: Joi.string()
          // .custom(commonValidation.dateFormatWithTime)
          .allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
    callbackDateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
    prefferedDeliveryDate: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
    rangeFilterBy: Joi.object()
      .keys({
        rangeFilterKey: Joi.string().allow(""),
        rangeInitial: Joi.string().allow(""),
        rangeEnd: Joi.string().allow(""),
      })
      .default({})
      .optional(),
    orderBy: Joi.string().allow(""),
    orderByValue: Joi.number().valid(1, -1).allow(""),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    filterBy: Joi.array().items(
      Joi.object().keys({
        fieldName: Joi.string().allow(""),
        value: Joi.alternatives().try(
          Joi.string().allow(""),
          Joi.number().allow(""),
          Joi.boolean().allow(""),
          Joi.array().items(Joi.string()).default([]),
          Joi.array().items(Joi.number()).default([]),
          Joi.array().items(Joi.boolean()).default([]),
          Joi.array().default([])
        ),
      })
    ),
    isPaginationRequired: Joi.boolean().default(true).optional(),
    orderNumber: Joi.string().allow(""),
    barcodeNumber: Joi.string().allow(""),
    getBatchData: Joi.boolean().optional(),
    callCenterId: Joi.string().custom(commonValidation.objectId).allow(null),
  }),
};

const getOrderLabel = {
  body: Joi.object().keys({
    awbNumber: Joi.string().required(),
  }),
};

const generateOrderInvoice = {
  body: Joi.object().keys({
    awbNumber: Joi.string().required(),
  }),
};
/**
 * filter and pagination api
 */
const getAllFilterDeliveryBoy = {
  body: Joi.object().keys({
    deliveryBoyId: Joi.string().custom(commonValidation.objectId).optional(),
    params: Joi.array().items(Joi.string().required()),
    searchValue: Joi.string().allow(""),
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
    rangeFilterBy: Joi.object()
      .keys({
        rangeFilterKey: Joi.string().allow(""),
        rangeInitial: Joi.string().allow(""),
        rangeEnd: Joi.string().allow(""),
      })
      .default({})
      .optional(),
    orderBy: Joi.string().allow(""),
    orderByValue: Joi.number().valid(1, -1).allow(""),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    filterBy: Joi.array().items(
      Joi.object().keys({
        fieldName: Joi.string().allow(""),
        value: Joi.alternatives().try(
          Joi.string().allow(""),
          Joi.number().allow(""),
          Joi.boolean().allow(""),
          Joi.array().items(Joi.string()).default([]),
          Joi.array().items(Joi.number()).default([]),
          Joi.array().items(Joi.boolean()).default([]),
          Joi.array().default([])
        ),
      })
    ),
    isPaginationRequired: Joi.boolean().default(true).optional(),
  }),
};

/**
 * get either all data or single document
 */
const get = {
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
    })
    .optional(),
};

const updateStatus = {
  body: Joi.object().keys({
    // barcode: Joi.array()
    //   .items(Joi.string().custom(commonValidation.objectId).required())
    //   .required(),
    status: Joi.string().required(),
    remark: Joi.string(),
    dispositionOne: Joi.string().custom(commonValidation.objectId).required(),
    dispositionTwo: Joi.string().custom(commonValidation.objectId).required(),
    orderId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const warehouseOrderDispatch = {
  body: Joi.object().keys({
    barcodes: Joi.array()
      .items({
        barcodeId: Joi.string().custom(commonValidation.objectId).required(),
        barcode: Joi.string().required(),
      })
      .required(),
    orderNumber: Joi.number().required(),
    type: Joi.string().required(),
  }),
};

const warehouseManualOrderDispatch = {
  body: Joi.object().keys({
    barcodes: Joi.array()
      .items({
        barcodeId: Joi.string().custom(commonValidation.objectId).required(),
        barcode: Joi.string().required(),
      })
      .required(),
    orderNumber: Joi.number().required(),
  }),
};

const assignOrder = {
  body: Joi.object().keys({
    dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
    warehouseId: Joi.string().custom(commonValidation.objectId).allow(null),
    orderId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const assignOrderToDeliveryBoy = {
  body: Joi.object().keys({
    orderId: Joi.string().custom(commonValidation.objectId).required(),
    deliveryBoyId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const prePaidApprove = {
  params: Joi.object().keys({
    orderid: Joi.string().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    transactionId: Joi.string().required(),
  }),
};

const getMultipleOrder = {
  body: Joi.object().keys({
    mobileNumbers: Joi.array().items(Joi.string()).allow(),
    orderNumbers: Joi.array().items(Joi.number()).allow(),
  }),
};

const getComplainData = {
  body: Joi.object().keys({
    barcode: Joi.string().allow(""),
    contactNumber: Joi.string().allow(""),

    complaintNumber: Joi.number(),
    email: Joi.string().allow(""),
    orderNumber: Joi.number(),
  }),
};

const ecomValidation = {
  body: Joi.object().keys({
    fullName: Joi.string(),
    mobile: Joi.string().required(),
    email: Joi.string(),
    pincode: Joi.string(),
    address: Joi.string(),
  }),
};

const updateDealerNdr = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    alternateNumber: Joi.string().allow(""),
    mobileNo: Joi.string().required(),
    dealerValidRemark: Joi.string().required(),
    ndrRemark: Joi.string().required(),
    ndrDiscountApplicable: Joi.boolean(),
    reAttemptDate: Joi.string().required(),
    ndrApprovedBy: Joi.string().required(),
    ndrCallDisposition: Joi.string()
      .custom(commonValidation.objectId)
      .required(),
    ndrRtoReattemptReason: Joi.string().required(),
  }),
};

const updateCourierNdr = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    alternateNumber: Joi.string().allow(""),
    mobileNo: Joi.string().required(),

    ndrApprovedBy: Joi.string().required(),
    dispositionTwoId: Joi.string().custom(commonValidation.objectId).required(),
    dispositionThreeId: Joi.string()
      .custom(commonValidation.objectId)
      .required(),
    ndrRemark: Joi.string().required(),
  }),
};

const changeScheme = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    schemeId: Joi.string().required(),
    ndrRemark: Joi.string().required(),
  }),
};

const firstCallConfirmation = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    address: Joi.string().required(),
    remark: Joi.string().required(),
    areaId: Joi.string().required(),
    callbackDate: Joi.string().allow(""),
    status: Joi.string().required(),
    alternateNo: Joi.string().required(),
    warehouseId: Joi.string().custom(commonValidation.objectId).required(),
    productData: Joi.array().items(
      Joi.string().custom(commonValidation.objectId).required()
    ),
  }),
};

const firstCallConfirmationUnauth = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    approvedBy: Joi.string().required(),
    address: Joi.string().required(),
    remark: Joi.string().required(),
    callbackDate: Joi.string().allow(""),
    status: Joi.string().required(),
    mobileNo: Joi.string().required(),
    alternateNo: Joi.string().required(),
    warehouseId: Joi.string().custom(commonValidation.objectId).required(),
    productData: Joi.array().items(
      Joi.string().custom(commonValidation.objectId).required()
    ),
  }),
};

const approveFirstCallDirectly = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().required(),
    warehouseId: Joi.string().custom(commonValidation.objectId).required(),
    productData: Joi.array().items(
      Joi.string().custom(commonValidation.objectId).required()
    ),
  }),
};
/**
 * delete a document
 */
const deleteDocument = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};

/**
 * change order status a document
 */
const orderStatusChange = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};

const unfreezeOrder = {
  params: Joi.object().keys({
    ordernumber: Joi.number(),
  }),
};
const bulkStatusChange = {
  body: Joi.object().keys({
    orderNumbers: Joi.array().items(Joi.string().required()),
    courierType: Joi.string().required(),
    status: Joi.string()
      .required()
      .valid(orderStatusEnum.delivered, orderStatusEnum.rto), // Only DELIVERED or RTO
    condition: Joi.string().when("status", {
      is: orderStatusEnum.rto, // If status is RTO
      then: Joi.required().valid(
        courierRTOType.fresh,
        courierRTOType.damage,
        courierRTOType.destroyed,
        courierRTOType.lost
      ), // condition is required and must be one of these values
      otherwise: Joi.string().allow(null), // Otherwise, condition should not be provided
    }),
  }),
  params: Joi.object().keys({
    wid: Joi.required().custom(commonValidation.objectId),
  }),
};

const dealerOrderStatusChange = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .valid(
        orderStatusEnum.delivered,
        orderStatusEnum.doorCancelled,
        orderStatusEnum.hold,
        orderStatusEnum.psc
      )
      .required(),
    remark: Joi.string().required(),
    dealerReason: Joi.string().required(),
    dealerFirstCaller: Joi.string()
      .custom(commonValidation.objectId)
      .allow(null),
    callBackDate: Joi.string().allow(""),
    barcodeData: Joi.array()
      .items({
        barcodeId: Joi.string().custom(commonValidation.objectId),
        barcode: Joi.string(),
        dealerWareHouseId: Joi.string().custom(commonValidation.objectId),
        productGroupId: Joi.string().custom(commonValidation.objectId),
      })
      .allow(),
  }),
};

const getOrderDashboardCount = {
  body: Joi.object().keys({
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        endDate: Joi.string().custom(commonValidation.dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
  }),
};

/**
 * get by id
 */
const getById = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};

/**
 * change status of document
 */
const changeStatus = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};
module.exports = {
  getAllFilter,
  get,
  // update,
  deleteDocument,
  changeStatus,
  getById,
  orderStatusChange,
  updateStatus,
  ecomValidation,
  getComplainData,
  assignOrder,
  assignOrderToDeliveryBoy,
  getAllFilterDeliveryBoy,
  prePaidApprove,
  getGlobalSearch,
  dealerOrderStatusChange,
  firstCallConfirmation,
  approveFirstCallDirectly,
  firstCallConfirmationUnauth,
  updateDealerNdr,
  updateCourierNdr,
  changeScheme,
  getMultipleOrder,
  getOrderDashboardCount,
  getOrderLabel,
  generateOrderInvoice,
  warehouseOrderDispatch,
  warehouseManualOrderDispatch,
  unfreezeOrder,
  bulkStatusChange,
};
