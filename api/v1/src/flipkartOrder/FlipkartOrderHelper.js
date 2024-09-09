const flipkartOrderService = require("./FlipkartOrderService");

exports.getOrderNumber = async () => {
  let orderNumber = 0;

  let lastObject = await flipkartOrderService.aggregateQuery([
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
