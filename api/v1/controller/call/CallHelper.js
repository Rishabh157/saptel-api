const { applicableCriteria } = require("../../helper/enumUtils");
const callService = require("../../services/CallService");
const InquiryService = require("../../services/InquiryService");
const prepaidOrderService = require("../../services/PrepaidOrderService");
const orderService = require("../../services/OrderService");

exports.getDealer = async (applicableCriterias) => {
  if (applicableCriterias.includes(applicableCriteria.isPrepaid)) {
    return null;
  } else {
  }
};

exports.getInquiryNumber = async () => {
  let inquiryNumber = 0;
  let lastObject = await InquiryService.aggregateQuery([
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);
  if (lastObject.length) {
    inquiryNumber = parseInt(lastObject[0].inquiryNumber) + 1;
  } else {
    inquiryNumber = 1;
  }
  return inquiryNumber;
};

exports.getPrepaidOrderNumber = async () => {
  let prepaidOrderNumber = 0;

  let lastObject = await prepaidOrderService.aggregateQuery([
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);
  if (lastObject.length) {
    prepaidOrderNumber = parseInt(lastObject[0].prepaidOrderNumber) + 1;
  } else {
    prepaidOrderNumber = 1;
  }
  return prepaidOrderNumber;
};

exports.getOrderNumber = async () => {
  let orderNumber = 0;

  let lastObject = await orderService.aggregateQuery([
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
