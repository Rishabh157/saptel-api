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
};
