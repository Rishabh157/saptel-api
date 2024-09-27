const { default: mongoose } = require("mongoose");
const rtvMasterService = require("./RtvMasterService");

const getrtvCode = async (companyId) => {
  let lastObject = await rtvMasterService.aggregateQuery([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  let rtvNumber = "";
  if (!lastObject.length) {
    rtvNumber = "RTV000001";
  } else {
    const lastSchemeCode = lastObject[0]?.rtvNumber || "RTV000000";
    const lastNumber = parseInt(lastSchemeCode.replace("RTV", ""), 10);
    const nextNumber = lastNumber + 1;
    rtvNumber = "RTV" + String(nextNumber).padStart(6, "0");
  }
  return rtvNumber;
};

module.exports = {
  getrtvCode,
};
