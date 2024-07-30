const jwt = require("jsonwebtoken");
const config = require("../../../config/config");
const userAccessService = require("../src/userAccess/UserAccessService");
const { getRedisClient } = require("../../../database/redis");

exports.combineObjects = (objectsArray) => {
  let arra = objectsArray.reduce((acc, el) => {
    return { ...acc, ...el };
  }, {});
  return arra;
};

exports.getQuery = (defaultQuery, reqQuery = false) => {
  if (defaultQuery && reqQuery && Object.keys(reqQuery)) {
    return Object.keys(reqQuery).reduce((acc, key) => {
      acc[key] = reqQuery[key];
      return acc;
    }, defaultQuery);
  }
  return defaultQuery;
};

exports.getFieldsToDisplay = (moduleName, userRoleData, actionName) => {
  let moduleData = userRoleData?.module?.find(
    (module) => module?.moduleName === moduleName
  );
  let actionDetails = moduleData?.moduleAction?.find(
    (m) => m?.actionName === actionName
  );
  let fields = actionDetails?.fields?.map((f) => {
    return f?.fieldValue;
  });
  if (fields?.length) {
    fields.push("_id");
  }
  return fields;
};

exports.getUserRoleData = async (req) => {
  let token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, config.jwt_secret);
  let userId = decoded?.Id;
  let userRoleId = decoded?.userRole;

  let matchQueryUser = { isDeleted: false, userId: userId };
  let matchQueryUserRole = { isDeleted: false, userRoleId: userRoleId };
  let dataExistWithUserId = await userAccessService.findAllWithQuery(
    matchQueryUser
  );
  let dataExistWithUserRole = await userAccessService.findAllWithQuery(
    matchQueryUserRole
  );

  return dataExistWithUserId.length
    ? dataExistWithUserId[0]
    : dataExistWithUserRole[0];
};

exports.getAllowedField = (allowedFields, result) => {
  if (allowedFields?.length) {
    let filteredResult = result?.map((item) => {
      let filteredItem = {};
      allowedFields?.forEach((field) => {
        filteredItem[field] = item[field];
      });
      return filteredItem;
    });

    return filteredResult;
  } else {
    return result;
  }
};

exports.generateRandomPassword = () => {
  const length = 8;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }

  return password;
};

exports.generateInvoiceString = async (branchCode, invoiceNumber) => {
  // Get the current date
  const currentDate = new Date();

  // Get the current year
  const currentYear = currentDate.getFullYear();

  // Calculate the financial year based on the current date
  const financialYear =
    currentDate.getMonth() >= 2
      ? `Y${(currentYear % 100) + 1}`
      : `Y${currentYear % 100}`;

  // Formatting invoice number with leading zeros
  const formattedInvoiceNumber = invoiceNumber.toString().padStart(4, "0");

  // Generating the string in the specified format
  const invoiceString = `${branchCode}/${financialYear}/${formattedInvoiceNumber}`;

  return invoiceString;
};

exports.logOut = async (req, logOutAll = false) => {
  let token = req.headers["x-access-token"];
  let deviceId = req.headers["device-id"] ? req.headers["device-id"] : "";
  const decoded = await jwt.verify(token, config.jwt_secret);
  const redisClient = await getRedisClient();
  if (!redisClient) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to connect to Redis."
    );
  }
  if (deviceId !== "" && logOutAll === false) {
    await redisClient.del(decoded.Id + deviceId);
  } else {
    const tokenKey = `${decoded.Id}*`;
    const allRedisValue = await redisClient.keys(tokenKey);

    const deletePromises = allRedisValue.map(
      async (key) => await redisClient.del(key)
    );
    await Promise.all(deletePromises);
  }
};
