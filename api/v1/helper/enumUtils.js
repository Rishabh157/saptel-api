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
  isOrder: "IS ORDER",
  isPrepaid: "IS PREPAID",
  isReplacement: "IS REPLACEMENT",
  isCallBack: "IS CALLBACK",
  isSchemeApp: "IS SCHEME APP",
  outOfStock: "OUT OF STOCK",
  isProductApp: "IS PRODUCT APP",
  adtApplicable: "ADT APPLICABLE",
  isTextboxReq: "IS TEXTBOX REQ",
  isUrgent: "IS URGENT",
  isRemarkDateApp: "IS REMARK DATE APP",
  isInquiry: "IS INQUIRY",
});

const genderType = Object.freeze({
  male: "MALE",
  female: "FEMALE",
  other: "OTHER",
});

const userEnum = Object.freeze({
  user: "USER",
  admin: "ADMIN",
  superAdmin: "SUPER_ADMIN",
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
const ledgerType = Object.freeze({
  credit: "CREDIT_NOTE_CREATED",
  debit: "DEBIT_NOTE_CREATED",
  dealerAmountCredited: "DEALER_AMOUNT_CREDItED",
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

module.exports = {
  allFileEnum,
  tokenEnum,
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
};
