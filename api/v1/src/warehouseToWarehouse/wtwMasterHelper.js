const { default: mongoose } = require("mongoose");
const wtwMasterService = require("./wtwMasterService");

const getWTWCode = async (companyId) => {
  let lastObject = await wtwMasterService.aggregateQuery([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  let wtNumber = "";
  if (!lastObject.length) {
    wtNumber = "WTW000001";
  } else {
    const lastSchemeCode = lastObject[0]?.wtNumber || "WTW000000";
    const lastNumber = parseInt(lastSchemeCode.replace("WTW", ""), 10);
    const nextNumber = lastNumber + 1;
    wtNumber = "WTW" + String(nextNumber).padStart(6, "0");
  }
  return wtNumber;
};

module.exports = {
  getWTWCode,
};
