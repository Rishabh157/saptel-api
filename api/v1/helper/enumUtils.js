const allFileEnum = Object.freeze({
  image: "IMAGE",
  document: "DOCUMENT",
  video: "VIDEO",
});

const tokenEnum = Object.freeze({ login: "LOGIN", otpverify: "OTP_VERIFY" });

const accountEnum = Object.freeze({ saving: "SAVING", current: "CURRENT" });
const userEnum = Object.freeze({
  user: "USER",
  admin: "ADMIN",
  superAdmin: "SUPER_ADMIN",
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
};
