const { default: mongoose } = require("mongoose");
const wtcMasterService = require("./wtcMasterService");

const getWTCCode = async (companyId) => {
  let lastObject = await wtcMasterService.aggregateQuery([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  let wtcNumber = "";
  if (!lastObject.length) {
    wtcNumber = "WTC000001";
  } else {
    const lastSchemeCode = lastObject[0]?.wtcNumber || "WTC000000";
    const lastNumber = parseInt(lastSchemeCode.replace("WTC", ""), 10);
    const nextNumber = lastNumber + 1;
    wtcNumber = "WTC" + String(nextNumber).padStart(6, "0");
  }
  return wtcNumber;
};

module.exports = {
  getWTCCode,
};
