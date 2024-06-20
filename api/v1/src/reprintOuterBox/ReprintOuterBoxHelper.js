const reprintOuterBoxService = require("./ReprintOuterBoxService");
exports.getInquiryNumber = async () => {
  let serialNo = 0;

  let lastObject = await reprintOuterBoxService.aggregateQuery([
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  if (lastObject.length) {
    serialNo = parseInt(lastObject[0].serialNo) + 1;
  } else {
    serialNo = 1;
  }
  return serialNo;
};
