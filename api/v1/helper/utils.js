const jwt = require("jsonwebtoken");
const config = require("../../../config/config");
const redisClient = require("../../../database/redis");

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
