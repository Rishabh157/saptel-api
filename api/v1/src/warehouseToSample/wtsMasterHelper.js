const { default: mongoose } = require("mongoose");
const wtsMasterService = require("./wtsMasterService");

const getWTSCode = async (companyId) => {
  let lastObject = await wtsMasterService.aggregateQuery([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  let wtsNumber = "";
  if (!lastObject.length) {
    wtsNumber = "WTS000001";
  } else {
    const lastSchemeCode = lastObject[0]?.wtsNumber || "WTS000000";
    const lastNumber = parseInt(lastSchemeCode.replace("WTS", ""), 10);
    const nextNumber = lastNumber + 1;
    wtsNumber = "WTS" + String(nextNumber).padStart(6, "0");
  }
  return wtsNumber;
};

module.exports = {
  getWTSCode,
};
