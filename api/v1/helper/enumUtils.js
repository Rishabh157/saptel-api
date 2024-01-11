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
  none: "",
});

const tapeType = Object.freeze({
  schemeCode: "SCHEME_CODE",
  promotional: "PROMOTIONAL",
  intruption: "INTRUPTION",
});

const complaintType = Object.freeze({
  complaint: "COMPLAINT",
  enquiry: "ENQUIRY",
});

const slotType = Object.freeze({
  fixed: "FIXED",
  flexible: "FLEXIBLE",
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

const companyEnum = Object.freeze({
  pltc: "Private Limited Company",
  plc: "Public Limited Company",
  psc: "Partnerships Company",
  llp: "Limited Liability Partnership",
  opc: "One Person Company",
  sp: "Sole Proprietorship",
  sec: "Section 8 Company",
});

const smsType = Object.freeze({
  alcobanSms: "ALCOBAN SMS",
  complaintCCA_CNC: "CUSTOMER NOT CONTACTABLE",
  complaintCCA_OWEI: "COMPLAINT CCA-ORDERS WITH EMAIL ID",
  complaintCCA_OWNEI: "COMPLAINT CCA-ORDERS WITHOUT EMAIL ID",
  complaintORC: "CREATE ORDER REFUND-CHEQUE",
  complaintORN: "CREATE ORDER REFUND-NEFT",
  complaintRPIM: "CREATE RPI-MANUAL",
  complaintRPI: "CREATE RPI-TV-SHOP COURIER ASSIGNED",
  complaintSCD: "COMPLAINT SERVICE DETAILS",
  createComplant: "CREATE COMPLAINT",
  dealerDelivered: "DEALER DELIVERED",
  dealerDeliveredBI: "DEALER DELIVERED BOY INTRANSIT",
  dispositionMsg: "DISPOSITION MESSAGE",
  hold: "HOLD",
  inTransitDB: "IN-TRANSIT-DELIVERY-BOY",
  invoiceSent: "INVOICE SENT",
});

const emailType = Object.freeze({
  personalEmail: "PERSONAL EMAIL",
  officialEmail: "OFFICIAL EMAIL",
  buisnessEmail: "BUISNESS EMAIL",
  companyEmail: "COMPANY EMAIL",
});

const whatsType = Object.freeze({
  temp1: "TEMP ONE",
  temp2: "TEMP TWO",
  temp3: "TEMP THREE",
});

const applicableCriteria = Object.freeze({
  isOrder: "IS_ORDER",
  isPrepaid: "IS_PREPAID",
  isReplacement: "IS_REPLACEMENT",
  isCallBack: "IS_CALLBACK",
  isSchemeApp: "IS_SCHEME_APP",
  outOfStock: "OUT_OF_STOCK",
  isProductApp: "IS_PRODUCT_APP",
  adtApplicable: "ADT_APPLICABLE",
  isTextboxReq: "IS_TEXTBOX_REQ",
  isUrgent: "IS_URGENT",
  isRemarkDateApp: "IS_REMARK_DATE_APP",
  isInquiry: "IS_INQUIRY",
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
  delivered: "DELIVERD",
  doorCancelled: "DOOCANCELLED",
  hold: "HOLD",
  psc: "PSC",
  una: "UNA",
  pnd: "PND",
  urgent: "URGENT",
  nonAction: "NON_ACTION",
});

const apiAppEnum = Object.freeze({
  web: "web",
  app: "app",
  dashboard: "dashboard",
  all: "all",
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
});

const userRoleType = Object.freeze({
  avpSales: "SALE_AVP",
  agmSale: "SALE_AGM_SALES",
  managerSalesCenter: "MANAGER_SALES_CENTER",
  asstManagerSalesCenter: "ASST_MANAGER_SALES_CENTER",
  srTeamLeaderOrSrEXECUTIVEMIS: "SR_TEAM_LEADER_OR_SR_EXECUTIVE_MIS",
  teamLeaderOrEXECUTIVESalesCenter: "TEAM_LEADER_OR_EXECUTIVE_SALES_CENTER",
  srEXECUTIVESalesCenter: "SR_EXECUTIVE_SALES_CENTER",
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
  delivered: "DELIVERED",
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
};
