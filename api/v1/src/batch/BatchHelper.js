const batchService = require("./BatchService");

exports.getInquiryNumber = async () => {
  let batchNumber = 0;

  let lastObject = await batchService.aggregateQuery([
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  if (lastObject.length) {
    batchNumber = parseInt(lastObject[0].batchNumber) + 1;
  } else {
    batchNumber = 1;
  }
  return batchNumber;
};
