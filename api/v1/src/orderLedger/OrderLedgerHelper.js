const orderLedgerService = require("./OrderLedgerService");
const { ledgerType } = require("../../helper/enumUtils");

exports.getDealerFromOrderLedger = async (dealerId) => {
  const dealerFound = await orderLedgerService.findAllWithQuery({
    dealerId: dealerId,
  });
  if (!dealerFound) {
    throw new ApiError(httpStatus.OK, "Dealer Not Found.");
  }
  let dealerExitsId = dealerFound[0]?.dealerId;
  return dealerExitsId;
};

exports.getBalance = async (dealerExitsId, creditAmount, debitAmount) => {
  let lastObject = await orderLedgerService.aggregateQuery([
    {
      $match: {
        dealerId: dealerExitsId,
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);
  let updatedBalance = 0;
  if (lastObject.length) {
    updatedBalance = parseInt(
      lastObject[0]?.balance + creditAmount - debitAmount
    );
  } else {
    updatedBalance = creditAmount - debitAmount;
  }

  return updatedBalance;
};
