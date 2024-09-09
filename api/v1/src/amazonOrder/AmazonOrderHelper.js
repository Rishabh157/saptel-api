const amazoneOrderService = require("./AmazonOrderService");

exports.getOrderNumber = async () => {
  let orderNumber = 0;

  let lastObject = await amazoneOrderService.aggregateQuery([
    { $match: { orderNumber: { $ne: null } } }, // Modify the $match stage
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  if (lastObject.length) {
    orderNumber = parseInt(lastObject[0].orderNumber) + 1;
  } else {
    orderNumber = 1;
  }
  return orderNumber;
};
