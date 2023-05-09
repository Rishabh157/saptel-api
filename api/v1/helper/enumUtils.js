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
  bad: "BAD",
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
};
