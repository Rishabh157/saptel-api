const Joi = require("joi").extend(require("@joi/date"));
Joi.joiDate = require("@joi/date")(Joi);
Joi.joiObjectId = require("joi-objectid")(Joi);
const commonValidation = require("../../helper/CommonValidation");

/**
 * create new document
 */
const create = {
  body: Joi.object().keys({
    productGroupId: Joi.string().custom(commonValidation.objectId).required(),
    barcodeGroupNumber: Joi.string().required(),
    quantity: Joi.number().required(),
    lotNumber: Joi.string().required(),
    isUsed: Joi.boolean(),
    // wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
    dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
    expiryDate: Joi.string().required(),
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
    productGroupId: Joi.string().custom(commonValidation.objectId).required(),
    barcodeGroupNumber: Joi.string().required(),
    cartonBoxId: Joi.string().custom(commonValidation.objectId).required(),
    outerBoxbarCodeNumber: Joi.string().required(),
    lotNumber: Joi.string().required(),
    isUsed: Joi.boolean(),
    wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
    dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
    status: Joi.string().required(),
    companyId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const updateInventory = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      barcodeGroupNumber: Joi.string().required(),
      cartonBoxId: Joi.string().custom(commonValidation.objectId).required(),
      // outerBoxbarCodeNumber: Joi.string().required(),
      lotNumber: Joi.string().required(),
      isUsed: Joi.boolean(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
      dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
      // status: Joi.string().required(),
      expiryDate: Joi.string().required(),
      isFreezed: Joi.boolean(),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
  }),
};
const updateWarehouseInventory = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      barcodeGroupNumber: Joi.string().required(),
      cartonBoxId: Joi.string().allow(null),
      // outerBoxbarCodeNumber: Joi.string().required(),
      lotNumber: Joi.string().required(),
      isUsed: Joi.boolean(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),

      dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
      // status: Joi.string().required(),
      toCompanyId: Joi.string().custom(commonValidation.objectId).allow(null),
      fromCompanyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    wId: Joi.array().items(Joi.string().required()).required(),
    from: Joi.string().required(),
  }),
};

const updateBarcodeToClose = {
  body: Joi.object().keys({
    barcodes: Joi.array().items(Joi.string().required()),
  }),
  params: Joi.object().keys({
    wid: Joi.required().custom(commonValidation.objectId),
  }),
};

const updateWarehouseInventoryDealer = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
    }),
    dtdRequestIds: Joi.array().items(Joi.string().required()).required(),
  }),
};

const outwardInventory = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      barcodeGroupNumber: Joi.string().required(),
      // cartonBoxId: Joi.string().custom(commonValidation.objectId).required(),
      outerBoxbarCodeNumber: Joi.string().allow(null),
      lotNumber: Joi.string().required(),
      isUsed: Joi.boolean(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
      dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
      barcodeNumber: Joi.string().required(),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    soId: Joi.array().items(Joi.string().required()),
    transportnameId: Joi.string().custom(commonValidation.objectId).required(),
    transporterGST: Joi.string().required(),
    mode: Joi.string().required(),
    distance: Joi.string().required(),
    vehicleNumber: Joi.string().required(),
    vehicleType: Joi.string().required(),
    transportDocNo: Joi.string().required(),
    documnetDate: Joi.string().required(),
    roadPermitNumber: Joi.string().allow(""),
    lrNo: Joi.string().allow(""),
    totalWeight: Joi.string().allow(""),
    totalPackages: Joi.string().allow(""),
    fileUrl: Joi.string().allow(""),
  }),
};

// rtv
const rtvOutwardInventory = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      barcodeGroupNumber: Joi.string().required(),
      // cartonBoxId: Joi.string().custom(commonValidation.objectId).required(),
      outerBoxbarCodeNumber: Joi.string().allow(null),
      lotNumber: Joi.string().required(),
      isUsed: Joi.boolean(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
      vendorId: Joi.string().custom(commonValidation.objectId).allow(null),
      dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
      barcodeNumber: Joi.string().required(),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    rtvId: Joi.array().items(Joi.string().required()),
  }),
};

// rtv
const wtwOutwardInventory = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      barcodeGroupNumber: Joi.string().required(),
      // cartonBoxId: Joi.string().custom(commonValidation.objectId).required(),
      outerBoxbarCodeNumber: Joi.string().allow(null),
      lotNumber: Joi.string().required(),
      isUsed: Joi.boolean(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
      dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
      barcodeNumber: Joi.string().required(),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    wtwId: Joi.array().items(Joi.string().required()),
  }),
};

// dtd
const dtdOutwardInventory = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      barcodeGroupNumber: Joi.string().required(),
      // cartonBoxId: Joi.string().custom(commonValidation.objectId).required(),
      outerBoxbarCodeNumber: Joi.string().allow(null),
      lotNumber: Joi.string().required(),
      isUsed: Joi.boolean(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
      dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
      barcodeNumber: Joi.string().required(),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    dtdId: Joi.array().items(Joi.string().required()),
  }),
};

//dtw
const dtwOutwardInventory = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      barcodeGroupNumber: Joi.string().required(),
      // cartonBoxId: Joi.string().custom(commonValidation.objectId).required(),
      outerBoxbarCodeNumber: Joi.string().allow(null),
      lotNumber: Joi.string().required(),
      isUsed: Joi.boolean(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
      dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
      barcodeNumber: Joi.string().required(),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    dtwId: Joi.array().items(Joi.string().required()),
  }),
};

// wtc
const wtcOutwardInventory = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      barcodeGroupNumber: Joi.string().required(),
      // cartonBoxId: Joi.string().custom(commonValidation.objectId).required(),
      outerBoxbarCodeNumber: Joi.string().allow(null),
      lotNumber: Joi.string().required(),
      isUsed: Joi.boolean(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
      dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
      barcodeNumber: Joi.string().required(),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
      toCompanyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    wtcId: Joi.array().items(Joi.string().required()),
  }),
};

// wts
const wtsOutwardInventory = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      barcodeGroupNumber: Joi.string().required(),
      // cartonBoxId: Joi.string().custom(commonValidation.objectId).required(),
      outerBoxbarCodeNumber: Joi.string().allow(null),
      lotNumber: Joi.string().required(),
      isUsed: Joi.boolean(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
      dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
      barcodeNumber: Joi.string().required(),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    wtsId: Joi.array().items(Joi.string().required()),
  }),
};

const orderDispatch = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      barcodeGroupNumber: Joi.string().required(),
      // cartonBoxId: Joi.string().custom(commonValidation.objectId).required(),
      // outerBoxbarCodeNumber: Joi.string().required(),
      lotNumber: Joi.string().required(),
      isUsed: Joi.boolean(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
      dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
      barcodeNumber: Joi.string().required(),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    orderId: Joi.string().custom(commonValidation.objectId).required(),
    deliveryBoyId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const assignDeliveryBoy = {
  body: Joi.object().keys({
    orderId: Joi.string().custom(commonValidation.objectId).required(),
    deliveryBoyId: Joi.string().custom(commonValidation.objectId).required(),
  }),
};

const dealerInwardInventory = {
  body: Joi.object().keys({
    barcodedata: Joi.array().items({
      _id: Joi.string().custom(commonValidation.objectId).required(),
      productGroupId: Joi.string().custom(commonValidation.objectId).required(),
      barcodeGroupNumber: Joi.string().required(),
      // cartonBoxId: Joi.string().custom(commonValidation.objectId).required(),
      // outerBoxbarCodeNumber: Joi.string().required(),
      lotNumber: Joi.string().required(),
      isUsed: Joi.boolean(),
      wareHouseId: Joi.string().custom(commonValidation.objectId).allow(null),
      dealerId: Joi.string().custom(commonValidation.objectId).allow(null),
      barcodeNumber: Joi.string().required(),
      companyId: Joi.string().custom(commonValidation.objectId).required(),
    }),
    soId: Joi.array().items(Joi.string().required()),
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
  params: Joi.object().keys({
    companyid: Joi.string().custom(commonValidation.objectId),
  }),
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(commonValidation.objectId).optional(),
    })
    .optional(),
};

const checkBarcode = {
  body: Joi.object().keys({
    barcode: Joi.string().required(),
    orderId: Joi.string().custom(commonValidation.objectId).required(),
    status: Joi.string().required(),
    latitude: Joi.string().required(),
    longitude: Joi.string().required(),
    // dealerId: Joi.string().custom(commonValidation.objectId).required,
  }),
};
/**
 * get a document
 */
const getDocument = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
  }),
};

const getGroupId = {
  params: Joi.object().keys({
    id: Joi.string(),
  }),
};

const getBarcode = {
  params: Joi.object().keys({
    barcode: Joi.string(),
  }),
};
const getDamageExpireBarcode = {
  params: Joi.object().keys({
    barcode: Joi.string().required(),
    wid: Joi.string().required(),
  }),
};

const getDispatchBarcode = {
  params: Joi.object().keys({
    barcode: Joi.string(),
    status: Joi.string(),
    wid: Joi.string().custom(commonValidation.objectId),
  }),
};

const getBarcodeForOutward = {
  params: Joi.object().keys({
    barcode: Joi.string(),

    productgroupid: Joi.string(),
    status: Joi.string(),
  }),
};

const getBarcodeForCustomerReturn = {
  params: Joi.object().keys({
    barcode: Joi.string(),
    status: Joi.string(),
  }),
};

const getBarcodeForCustomerReturnFromOrderNo = {
  params: Joi.object().keys({
    orderno: Joi.number(),
  }),
};

const getInventory = {
  params: Joi.object().keys({
    // cid: Joi.string(),
    wid: Joi.string(),
    status: Joi.string(),
  }),
  body: Joi.object().keys({
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

const getInventoryByStatus = {
  params: Joi.object().keys({
    cid: Joi.string(),
    status: Joi.string(),
  }),
  body: Joi.object().keys({
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
 * delete a document
 */
const deleteDocument = {
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

const freezeBarcode = {
  params: Joi.object().keys({
    status: Joi.boolean(),
  }),
  body: Joi.object().keys({
    bcode: Joi.array().items(Joi.string()),
  }),
};

const courierReturn = {
  params: Joi.object().keys({
    id: Joi.string().custom(commonValidation.objectId),
    whid: Joi.string().custom(commonValidation.objectId),
  }),
  body: Joi.object().keys({
    barcode: Joi.array()
      .items({
        barcode: Joi.string().required(),
        condition: Joi.string().required(),
      })
      .required(),
    orderNumber: Joi.number().required(),
  }),
};

module.exports = {
  create,
  getAllFilter,
  get,
  update,
  deleteDocument,
  changeStatus,
  getDocument,
  getGroupId,
  getBarcode,
  getInventory,
  updateInventory,
  outwardInventory,
  getBarcodeForOutward,
  dealerInwardInventory,
  rtvOutwardInventory,
  wtcOutwardInventory,
  wtsOutwardInventory,
  wtwOutwardInventory,
  updateWarehouseInventory,
  getInventoryByStatus,
  orderDispatch,
  dtwOutwardInventory,
  checkBarcode,
  assignDeliveryBoy,
  dtdOutwardInventory,
  updateWarehouseInventoryDealer,
  courierReturn,
  getDispatchBarcode,
  getBarcodeForCustomerReturn,
  freezeBarcode,
  getBarcodeForCustomerReturnFromOrderNo,
  updateBarcodeToClose,
  getDamageExpireBarcode,
};
