const { object } = require("joi");

const allFileEnum = Object.freeze({
  image: "IMAGE",
  document: "DOCUMENT",
  video: "VIDEO",
});

const tokenEnum = Object.freeze({ login: "LOGIN", otpverify: "OTP_VERIFY" });

const accountEnum = Object.freeze({ saving: "SAVING", current: "CURRENT" });
const inventoryStatus = Object.freeze({
  available: "AVAILABLE",
  outOfStock: "OUTOFSTOCK",
});
const inventoryCondition = Object.freeze({
  good: "GOOD",
  defective: "DEFECTIVE",
});

const productStatus = Object.freeze({
  notDispatched: "NOT_DISPATCHED",
  dispatched: "DISPATCHED",
  complete: "COMPLETE",
  cancelled: "CANCELLED",
  none: "",
});

const tapeType = Object.freeze({
  schemeCode: "SCHEME_CODE",
  promotional: "PROMOTIONAL",
  intruption: "INTRUPTION",
});

const complaintType = Object.freeze({
  complaint: "COMPLAINT",
  inquiry: "INQUIRY",
  feedback: "FEEDBACK",
});

const slotType = Object.freeze({
  fixed: "FIXED",
  flexible: "FLEXIBLE",
});

const subDispositionNDR = Object.freeze({
  cancel: "CANCEL",
  attempt: "ATTEMPT",
  rto: "RTO",
  hold: "HOLD",
  customerWillConnect: "CUSTOMERWILLCONNECT",
});

const ndrRtoAttemptEnum = Object.freeze({
  cancel: "CANCEL",
  adtm: "ADTM",
  adoth: "ADOTH",
  notReachable: "NOTREACHABLE",
  numberBusy: "NUMBERBUSY",
  ringingNoResponse: "RINGINGNORESPONSE",
  switchOff: "SWITCHOFF",
  notConnected: "NOTCONNECTED",
  notInterested: "NOTINTERESTED",
  callBack: "CALLBACK",
  other: "OTHER",
  dnc: "DNC",
  dcFOR: "DCFOR",
  dcUCR: "DCUCR",
  schemeOffered: "SCHEMEOFFERED",
  webReattempt: "WEBREATTEMPT",
});

const slotDaysType = Object.freeze({
  monday: "MONDAY",
  tuesday: "TUESDAY",
  wednesday: "WEDNESDAY",
  thursday: "THURSDAY",
  friday: "FRIDAY",
  saturday: "SATURDAY",
  sunday: "SUNDAY",
});

const customerReturnRequestType = Object.freeze({
  moneyBack: "MONEYBACK",
  replacement: "REPLACEMENT",
  houseArrest: "HOUSEARREST",
});

const companyEnum = Object.freeze({
  pltc: "PRIVATE_LIMITED_COMPANY",
  plc: "PUBLIC_LIMITED_COMPANY",
  psc: "PARTNERSHIPS_COMPANY",
  llp: "LIMITED_LIABILITY_PARTNERSHIP",
  opc: "ONE_PERSON_COMPANY",
  sp: "SOLE_PROPRIETORSHIP",
  sec: "SECTION_8_COMPANY",
});

const callPageTabType = Object.freeze({
  history: "history",
  order: "order",
  complaint: "complaint",
});

const smsType = Object.freeze({
  alcobanSms: "ALCOBAN_SMS",
  complaintCCA_CNC: "COMPLAINT_CCA-CUSTOMER_NOT_CONTACTABLE",
  complaintCCA_OWEI: "COMPLAINT_CCA-ORDERS_WITH_EMAIL_ID",
  complaintCCA_OWNEI: "COMPLAINT_CCA-ORDERS_WITHOUT_EMAIL_ID",
  complaintORC: "COMPLAINT_ORDER_REFUNDED-CHEQUE",
  complaintORN: "COMPLAINT_ORDER_REFUNDED-NEFT",
  complaintRPIM: "COMPLAINT_RPI-MANUAL",
  complaintRPI: "COMPLAINT_RPI-TV-SHOP_COURIER_ASSIGNED",
  complaintSCD: "COMPLAINT_SERVICE_CENTRE_DETAILS",
  createComplant: "CREATE_COMPLAINT",
  dealerDelivered: "DEALER_DELIVERED",
  dealerDeliveredBI: "DEALER_DELIVERED_BOY_INTRANSIT",
  dealer_intransite: "DEALER_INTRANSIT",
  default: "DEFAULT",
  dhundhar: "DHUNDHAR",
  dispositionMsg: "DISPOSITION_MESSAGE",
  hold: "HOLD",
  inTransitDB: "IN-TRANSIT_DELIVERY_BOY",
  invoiceSent: "INVOICE_SENT",
  nonConnect: "NON-CONNECT",
  orderCancellationAgentId: "ORDER_CANCELLATION-CANCELLATION_BY_AN_AGENT_ID",
  orderCancellationOutOfStock: "ORDER_CANCELLATION-OUT_OF_STOCK",
  orderCreation: "ORDER_CREATION",
  orderCreationTest: "ORDER_CREATION_TEST",
  orderDelivered: "ORDER_DELIVERED",
  orderMarkedNDR: "ORDER_MARKED_NDR",
  orderShippedCOD: "ORDER_SHIPPED_COD",
  orderShippedPrepaid: "ORDER_SHIPPED_PREPAID",
  orderShippingSlaBreach: "ORDER_SHIPPING_SLA_BREACH",
  orderVerification: "ORDER_VERIFICATION",
  orderManualSms: "ORDER-MANUAL_SMS",
  productReceived: "PRODUCT_RECEIVED",
  refundChequePrepared: "REFUND_CHEQUE_PREPARED",
  refundProcessed: "REFUND_PROCESSED",
  replacementOrderCreat: "REPLACEMENT_ORDER_CREAT",
  replacementOrderShipp: "REPLACEMENT_ORDER_SHIPP",
  replacementProcessed: "REPLACEMENT_PROCESSED",
  sendCourierDetails: "SEND_COURIER_DETAILS",
  test: "TEST",
  tribeslimSms: "TRIBESLIM_SMS",
  urgentOrder: "URGENT_ORDER",
});

const emailType = Object.freeze({
  personalEmail: "PERSONAL_EMAIL",
  officialEmail: "OFFICIAL_EMAIL",
  buisnessEmail: "BUISNESS_EMAIL",
  companyEmail: "COMPANY_EMAIL",
});

const whatsType = Object.freeze({
  temp1: "TEMP_ONE",
  temp2: "TEMP_TWO",
  temp3: "TEMP_THREE",
});

const applicableCriteria = Object.freeze({
  isOrder: "ISORDER",
  isPrepaid: "ISPREPAID",
  isReplacement: "ISREPLACEMENT",
  isCallBack: "ISCALLBACK",
  isSchemeApp: "ISSCHEMEAPP",
  outOfStock: "OUTOFSTOCK",
  isProductApp: "ISPRODUCTAPP",
  adtApplicable: "ADTAPPLICABLE",
  isTextboxReq: "ISTEXTBOXREQ",
  isUrgent: "ISURGENT",
  isRemarkDateApp: "ISREMARKDATEAPP",
  isInquiry: "ISINQUIRY",
});

const genderType = Object.freeze({
  male: "MALE",
  female: "FEMALE",
  other: "OTHER",
});

const paymentModeType = Object.freeze({
  COD: "COD",
  UPI_ONLINE: "ONLINE",
});

const userEnum = Object.freeze({
  user: "USER",
  admin: "ADMIN",
  superAdmin: "SUPER_ADMIN",
});

const orderStatusEnum = Object.freeze({
  fresh: "FRESH",
  all: "ALL",
  prepaid: "PREPAID",
  delivered: "DELIVERED",
  doorCancelled: "DOORCANCELLED",
  hold: "HOLD",
  psc: "PSC",
  una: "UNA",
  pnd: "PND",
  urgent: "URGENT",
  nonAction: "NON_ACTION",
  rto: "RTO",
  inquiry: "INQUIRY",
  reattempt: "REATTEMPT",
  deliveryOutOfNetwork: "DELIVERYOUTOFNETWORK",
  intransit: "INTRANSIT",
  ndr: "NDR",
  closed: "CLOSED",
  cancel: "CANCEL",
});

const dealerReasonEnum = Object.freeze({
  deliveredSuccessfully: "DELIVEREDSUCCESSFULLY",
  deliveryOutOfNetwork: "DELIVERYOUTOFNETWORK",
  pending: "PENDING",
  confirmed: "CONFIRMED",
  callBack: "CALLBACK",
  holdCancel: "HOLDCANCEL",
  callBackFutureConfirmed: "CALLBACKFUTURECONFIRMED",
  customerNotAvailable: "CUSTOMERNOTAVAILABLE",
  unclaimed: "UNCLAIMED",
  refused: "REFUSED",
  intimationOnly: "INTIMATIONONLY",
  wrongPicodeAddressPhone: "WRONGPINCODEADDRESSPHONENUMBER",
  noCash: "NOCASH",
  notInterested: "NOTINTERESTED",
  fakeOrder: "FAKEORDER",
  demandOpenParcel: "DEMANDOPENPARCEL",
  notSatisfiedAfterOpening: "NOTSATISFIEDAFTEROPENING",
  notAcceptingCCC: "NOTACCEPTINGCCC",
  delayDelivery: "DELAYDELIVERY",
  productChangeAndReassign: "PRODUCTCHANGEANDREASSIGN",
  outOfServiceableArea: "OUTOFSERVICEABLEAREA",
  cancellationAfterShipping: "CANCELLATIONAFTERSHIPPING",
  rnr: "RNR",
  personNotAvailable: "PERSONNOTAVAILABLE",
  damagedParcel: "DAMAGEDPARCEL",
  customerNotPickupTheCall: "CUSTOMERNOTPICKUPTHECALL",
  customerWantsToCancelTheOrder: "CUSTOMERWANTSTOCANCELTHEORDER",
  noOrderPlaced: "NOORDERPLACED",
  wrongNumber: "WRONGNUMBER",
  doNotWant: "DONOTWANT",
  nonServiceableArea: "NONSERVICEABLEAREA",
  outOfAssignedArea: "OUTOFASSIGNEDAREA",
  pickByCourier: "PICKBYCOURIER",
});

const customerReputationColor = Object.freeze({
  red: "RED",
  orange: "ORANGE",
  green: "GREEN",
});

const orderCancelReason = Object.freeze({
  wrongScheme: "WRONG_SCHEME",
  wrongPaymentMode: "WRONG_PAYMENT_MODE",
  stockUnavailability: "STOCK_UNAVAILABILITY",
  other: "OTHER",
});

const validDealerRemark = Object.freeze({
  correct: "CORRECT",
  incorrect: "INCORRECT",
  notapplicable: "NOTAPPLICABLE",
});

const apiAppEnum = Object.freeze({
  web: "web",
  app: "app",
  dashboard: "dashboard",
  all: "all",
});

const complainCallTypeEnum = Object.freeze({
  complaint: "COMPLAINT",
  inquiry: "INQUIRY",
});

const complainStatusEnum = Object.freeze({
  open: "OPEN",
  closed: "CLOSED",
  pending: "PENDING",
});
const paymentType = Object.freeze({
  cheque: "CHEQUE",
  netBanking: "NETBANKING",
  cash: "CASH",
  creditCard: "CREDITCARD",
  debitCard: "DEBITCARD",
});

const actionType = Object.freeze({
  pagination: "LIST",
  listAll: "LIST_ALL",
  view: "VIEW",
});
const approvalType = Object.freeze({
  first: "FIRST",
  second: "SECOND",
});

const moduleType = Object.freeze({
  vendor: "VENDOR",
  dealer: "DEALER",
  user: "USER",
  wareHouse: "WAREHOUSE",
  saleOrder: "SALE_ORDER",
  rtvOrder: "RTV_ORDER",
  wtwOrder: "WTW_ORDER",
  dtwOrder: "DTW_ORDER",
  wtsOrder: "WTS_ORDER",
  wtcOrder: "WTC_ORDER",
  dtwOrder: "DTW_ORDER",
  asr: "ASR",
  purchaseOrder: "PURCHASE_ORDER",
  grn: "GRN",
  inquiry: "INQUIRY",
  callerPage: "CALLER_PAGE",
  order: "ORDER",
  order_inquiry_flow: "ORDER_INQUIRY_FLOW",
  attribute: "ATTRIBUTE",
  attributeGroup: "ATTRIBUTE_GROUP",
  productCategory: "PRODUCT_CATEGORY",
  productSubCategory: "PRODUCT_SUB_CATEGORY",
  productGroup: "PRODUCT_GROUP",
  scheme: "SCHEME",
  item: "ITEM",
  product: "PRODUCT",
  cartonBox: "CARTON_BOX",
  callCenter: "CALL_CENTER_MASTER",
  company: "COMPANY",
  barcode: "BARCODE",
  locations: "LOCATIONS",
  country: "COUNTRY",
  state: "STATE",
  district: "DISTRICT",
  tehsil: "TEHSIL",
  pincode: "PINCODE",
  area: "AREA",
  language: "LANGUAGE",
  dealerCategory: "DEALER_CATEGORY",
  channelGroup: "CHANNEL_GROUP",
  channelCategory: "CHANNEL_CATEGORY",
  channelManagement: "CHANNEL_MANAGEMENT",
  didManagement: "DID_MANAGEMENT",
  artist: "ARTIST",
  competitor: "COMPETITOR",
  slotManagement: "SLOT_MANAGEMENT",
  tapeManangement: "TAPE_MANAGEMENT",
  assetRequest: "ASSET_REQUEST",
  assetCategory: "ASSET_CATEGORY",
  assetLocation: "ASSET_LOCATION",
  assetRelocation: "ASSET_RELOCATION",
  assetAllocation: "ASSET_ALLOCATION",
  dispositionOne: "DISPOSITION_ONE",
  dispositionTwo: "DISPOSITION_TWO",
  dispositionThree: "DISPOSITION_THREE",
  initialCallerOne: "INITIAL_CALLER_ONE",
  initialCallerTwo: "INITIAL_CALLER_TWO",
  initialCallerThree: "INITIAL_CALLER_THREE",
  dispositionComplaint: "DISPOSITION_COMPLAINT",
  website: "WEBSITE",
  websiteBlog: "WEBSITE_BLOG",
  websitePage: "WEBSITE_PAGE",
  websiteTags: "WEBSITE_TAGS",
  companyBranch: "COMPANY_BRANCH",
});
const userDepartmentType = Object.freeze({
  salesDepartment: "SALES_DEPARTMENT",
  hrDepartment: "HR_DEPARTMENT",
  distributionDepartment: "DISTRIBUTION_DEPARTMENT",
  financeDepartment: "FINANCE_DEPARTMENT",
  mediaDepartment: "MEDIA_DEPARTMENT",
  mediaProductionDepartment: "MEDIA_PRODUCTION_DEPARTMENT",
  ITDepartment: "IT_DEPARTMENT",
  DevelopmentDepartment: "DEVELOPMENT_DEPARTMENT",
  webDepartment: "WEB_DEPARTMENT",
  operationDepartment: "OPERATION_DEPARTMENT",
  qualityDepartment: "QUALITY_DEPARTMENT",
  logisticDepartment: "LOGISTIC_DEPARTMENT",
  mappingAndMISDepartment: "MAPPING_AND_MIS_DEPARTMENT",
  adminDepartment: "ADMIN_DEPARTMENT",
  customerCareDepartement: "CUSTOMER_CARE_DEPARTMENT",
});

const userRoleType = Object.freeze({
  avpSales: "SALE_AVP",
  agmSale: "SALE_AGM_SALES",
  managerSalesCenter: "MANAGER_SALES_CENTER",
  asstManagerSalesCenter: "ASST_MANAGER_SALES_CENTER",
  srTeamLeaderOrSrEXECUTIVEMIS: "SR_TEAM_LEADER_OR_SR_EXECUTIVE_MIS",
  teamLeaderOrEXECUTIVESalesCenter: "TEAM_LEADER_OR_EXECUTIVE_SALES_CENTER",
  srEXECUTIVESalesCenter: "SR_EXECUTIVE_SALES_CENTER",
  executiveSalesCenter: "EXECUTIVE_SALES_CENTER",
  EXECUTIVETrainee: "EXECUTIVE_TRAINEE",
  avpHr: "HR_AVP",
  amgHrAndStatutoryCompliance: "AMG_HR_AND_STATUTORY_COMPLIANCE",
  asstManagerHr: "ASST_MANAGER_HR",
  srEXECUTIVEHr: "SR_EXECUTIVE_HR",
  EXECUTIVEHr: "EXECUTIVE_HR",
  avpDistribution: "DISTRIBUTION_AVP",
  srManagerDistribution: "SR_MANAGER_DISTRIBUTION",
  managerArea: "MANAGER_AREA",
  srEXECUTIVEArea: "SR_EXECUTIVE_AREA",
  EXECUTIVEArea: "EXECUTIVE_AREA",
  avpFinance: "FINANCE_AVP",
  agmFinance: "AGM_FINANCE",
  srManagerFinance: "SR_MANAGER_FINANCE",
  managerFinance: "MANAGER_FINANCE",
  amFinance: "AM_FINANCE",
  EXECUTIVEFinance: "EXECUTIVE_FINANCE",
  avpMedia: "MEDIA_AVP",
  agmMediaPlanningAndProcurement: "AGM_MEDIA_PLANNING_AND_PROCUREMENT",
  amMedia: "AM_MEDIA",
  EXECUTIVEMedia: "EXECUTIVE_MEDIA",
  avpMediaProduction: "AVP_MEDIA_PRODUCTION",
  srManagerMediaProduction: "SR_MANAGER_MEDIA_PRODUCTION",
  srEditor: "SR_EDITOR",
  videoEditor: "VIDEO_EDITOR",
  associateAditor: "ASSOCIATE_EDITOR",
  avpIT: "IT_AVP",
  managerSystemAndNetwork: "MANAGER_SYSTEM_AND_NETWORK",
  managerServerAndIT: "MANAGER_SERVER_AND_IT",
  managerTelecomAndTechnology: "MANAGER_TELECOM_AND_TECHNOLOGY",
  amNetwork: "AM_NETWORK",
  EXECUTIVENetwork: "EXECUTIVE_NETWORK",
  EXECUTIVEIT: "EXECUTIVE_IT",
  avpDevelopment: "DEVELOPMENT_AVP",

  graphicDesigner: "GRAPHIC_DESIGNER",
  productDevelopmentAndResearch: "PRODUCT_DEVELOPMENT_AND_RESEARCH",
  sr3dArtist: "SR_3D_ARTIST",
  srVFXArtist: "SR_VFX_ARTIST",
  srVisualize: "SR_VISUALIZE",
  avpWebDevelopment: "WEB_DEVELOPMENT_AVP",
  srManagerDigitalsales: "SR_MANAGER_DIGITAL_SALES",
  srManagerSEO: "SR_MANAGER_SEO",
  managerSEO: "MANAGER_SEO",
  EXECUTIVESEO: "EXECUTIVE_SEO",
  contentCreator: "CONTENT_CREATOR",
  contentWriter: "CONTENT_WRITER",
  frontendDeveloper: "FRONTEND_DEVELOPER",
  graphicDesignerWeb: "GRAPHIC_DESIGNER_WEB",
  jrWebDeveloper: "JR_WEB_DEVELOPER",

  srWebDeveloper: "SR_WEB_DEVELOPER",
  webDeveloper: "WEB_DEVELOPER",
  avpOperations: "AVP_OPERATIONS",

  vpOperations: "VP_OPERATIONS",
  agmCompliance: "AGM_COMPLIANCE",
  agmOperations: "AGM_OPERATIONS",
  avpQA: "QA_AVP",
  amQA: "AM_QUALITY_ANALYST",
  teamLeaderQualityAnalyst: "TEAM_LEADER_QUALITY_ANALYST",
  EXECUTIVEQualityAnalyst: "EXECUTIVE_QUALITY_ANALYST",
  avpLogistics: "LOGISTICS_AVP",
  managerLogistics: "MANAGER_LOGISTICS",
  amLogistics: "AM_LOGISTICS",
  EXECUTIVELogistics: "EXECUTIVE_LOGISTICS",
  avpMapping: "MAPPING_AVP",
  managerMIS: "MANAGER_MIS",
  EXECUTIVEMIS: "EXECUTIVE_MIS",
  avpAdmin: "ADMIN_AVP",
  managerAdmin: "MANAGER_ADMIN",
  srEXECUTIVEAdmin: "SR_EXECUTIVE_ADMIN",
  EXECUTIVEAdmin: "EXECUTIVE_ADMIN",
  customerCareAvp: "CUSTOMER_CARE_AVP",
  customerCareManager: "CUSTOMER_CARE_MANAGER",
  customerCareAm: "CUSTOMER_CARE_AM",
  customerCareTeamLead: "CUSTOMER_CARE_TEAM_LEADER",
  customerCareSrEx: "CUSTOMER_CARE_SR_EXECUTIVE",
  customerCareEx: "CUSTOMER_CARE_EXECUTIVE",
});
const ledgerType = Object.freeze({
  credit: "CREDIT_NOTE_CREATED",
  debit: "DEBIT_NOTE_CREATED",
  dealerAmountCredited: "DEALER_AMOUNT_CREDITED",
});

const orderType = Object.freeze({
  prepaid: "PREPAID",
  postpaid: "POSTPAID",
  other: "OTHER",
});

// barcode status type
const barcodeStatusType = Object.freeze({
  atWarehouse: "AT_WAREHOUSE",
  atDealerWarehouse: "AT_DEALER_WAREHOUSE",
  inTransit: "IN_TRANSIT",
  delivered: "DELIVERED",
  rtv: "RTV",
  wtc: "WTC",
  wts: "WTS",
  wtw: "WTW",
  dtw: "DTW",
  dtd: "DTD",
  delivered: "DELIVERED",
  damage: "DAMAGE",
  missing: "MISSING",
  fake: "FAKE",
  expired: "EXPIRED",
  destroyed: "DESTROYED",
  close: "CLOSED",
});

const tallyLedgerType = Object.freeze({
  cretidNote: "Credit Note-1",
  debitNote: "Debit Note",
});

/**
 * if other the following routes created. please add all actions with their method,
 */
const actionMethodEnum = Object.freeze({
  add: "post",
  update: "put",
  delete: "delete",
  change_status: "put",
  all_list: "get",
  all_list_pagination_filter: "post",
  view: "get",
});

const dealerMissingDamageType = Object.freeze({
  missing: "MISSING",
  damage: "DAMAGE",
});

const firstCallDispositions = Object.freeze({
  callBack: "CALLBACK",
  approved: "APPROVED",
  languageBarrier: "LANGUAGEBARRIER",
  cancel: "CANCEL",
});

const preferredCourierPartner = Object.freeze({
  shipyaari: "SHIPYAARI",
  gpo: "GPO",
});

const courierRTOType = Object.freeze({
  fresh: "FRESH/REUSEALE",
  damage: "DAMAGE",
  fake: "FAKE",
  lost: "LOST",
});

const orderTypeEnum = Object.freeze({
  inbound: "INBOUND",
  website: "WEBSITE",
  amazone: "AMAZONE",
  customerCare: "CUSTOMERCARE",
});

const reasonNotShowSlot = Object.freeze({
  scrollOnNumbers: "SCROLL ON NUMBERS",
  audioWasNotProper: "AUDIO WAS NOT PROPER",
  showNotRunFully: "SHOW NOT RUN FULLY",
  disortionInVideo: "DISTORTION IN VIDEO",
  other: "OTHER",
});

const competitorProductCategory = Object.freeze({
  herbal: "HERBAL",
  education: "EDUCATION",
  spiritual: "SPIRITUAL",
  other: "OTHER",
});

module.exports = {
  allFileEnum,
  tokenEnum,
  orderType,
  accountEnum,
  userEnum,
  actionMethodEnum,
  apiAppEnum,
  companyEnum,
  inventoryStatus,
  inventoryCondition,
  tapeType,
  slotType,
  slotDaysType,
  paymentType,
  complaintType,
  smsType,
  emailType,
  genderType,
  applicableCriteria,
  whatsType,
  reasonNotShowSlot,
  ledgerType,
  userDepartmentType,
  userRoleType,
  paymentModeType,
  actionType,
  moduleType,
  competitorProductCategory,
  orderStatusEnum,
  productStatus,
  approvalType,
  barcodeStatusType,
  complainCallTypeEnum,
  complainStatusEnum,
  ndrRtoAttemptEnum,
  callPageTabType,
  customerReputationColor,
  firstCallDispositions,
  orderTypeEnum,
  validDealerRemark,
  subDispositionNDR,
  preferredCourierPartner,
  dealerReasonEnum,
  dealerMissingDamageType,
  orderCancelReason,
  courierRTOType,
  tallyLedgerType,
  customerReturnRequestType,
};
