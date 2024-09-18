const wareHouseService = require("./WareHouseService");

const getWarehouseCode = async () => {
  let lastObject = await wareHouseService.aggregateQuery([
    { $match: { dealerId: null } },
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  let wareHouseCode = "";
  if (!lastObject.length) {
    wareHouseCode = "WH00001";
  } else {
    const lastSchemeCode = lastObject[0]?.wareHouseCode || "WH00000";
    const lastNumber = parseInt(lastSchemeCode.replace("WH", ""), 10);
    const nextNumber = lastNumber + 1;
    wareHouseCode = "WH" + String(nextNumber).padStart(5, "0");
  }
  return wareHouseCode;
};

const getDealerWarehouseCode = async () => {
  let lastObject = await wareHouseService.aggregateQuery([
    { $match: { dealerId: { $ne: null } } },
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  let wareHouseCode = "";
  if (!lastObject.length) {
    wareHouseCode = "DLWH00001";
  } else {
    const lastSchemeCode = lastObject[0]?.wareHouseCode || "DLWH00000";
    const lastNumber = parseInt(lastSchemeCode.replace("DLWH", ""), 10);
    const nextNumber = lastNumber + 1;
    wareHouseCode = "DLWH" + String(nextNumber).padStart(5, "0");
  }
  return wareHouseCode;
};

module.exports = {
  getWarehouseCode,
  getDealerWarehouseCode,
};
