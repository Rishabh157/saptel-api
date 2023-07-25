const jwt = require("jsonwebtoken");
const config = require("../../../config/config");
const redisClient = require("../../../database/redis");
const SlotDefinition = require("../src/slotDefination/SlotDefinitionService");
const SlotMaster = require("../src/slotMaster/SlotMasterService");
const moment = require("moment"); // You may need to install the moment library using 'npm install moment'

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

exports.getUserRoleData = async (req, service) => {
  let token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, config.jwt_secret);
  let userId = decoded?.Id;
  let userRoleId = decoded?.userRole;

  let matchQueryUser = { isDeleted: false, userId: userId };
  let matchQueryUserRole = { isDeleted: false, userRoleId: userRoleId };
  let dataExistWithUserId = await service.findAllWithQuery(matchQueryUser);
  let dataExistWithUserRole = await service.findAllWithQuery(
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

exports.logOut = async (req, logOutAll = false) => {
  let token = req.headers["x-access-token"];
  let deviceId = req.headers["device-id"] ? req.headers["device-id"] : "";
  const decoded = await jwt.verify(token, config.jwt_secret);
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

exports.addSlotEveryDayFun = async () => {
  const slotDefinition = await SlotDefinition.findAllWithQuery({
    isDeleted: false,
    slotContinueStatus: true,
  });

  const todayDate = moment().format("DD/MM/YYYY");
  const todayDay = moment().format("dddd").toUpperCase();

  const filteredSlots = slotDefinition?.filter((slot) => {
    const slotStartDate = slot?.slotStartDate;
    const slotDay = slot?.slotDay?.map((day) => day.toUpperCase());

    return (
      moment(slotStartDate, "DD/MM/YYYY").isBefore(
        moment(todayDate, "DD/MM/YYYY")
      ) && slotDay?.includes(todayDay)
    );
  });

  filteredSlots?.forEach(async (ele) => {
    await SlotMaster.createNewData({
      slotName: ele.slotName,
      channelGroupId: ele.channelGroupId,
      type: ele.type,
      tapeNameId: ele.tapeNameId,
      channelNameId: ele.channelNameId,
      channelTrp: ele.channelTrp,
      remarks: ele.remarks,
      slotPrice: ele.slotPrice,
      slotDay: ele.slotDay,
      slotStartTime: ele.slotStartTime,
      slotEndTime: ele.slotEndTime,
      slotContinueStatus: ele.slotContinueStatus,
      runYoutubeLink: "",
      run: false,
      showOk: false,
      slotRunImage: "",
      slotRunVideo: "",
      reasonNotShow: null,
      runStartTime: "",
      runEndTime: "",
      runRemark: "",
      companyId: ele.companyId || "",
    });
  });
};
