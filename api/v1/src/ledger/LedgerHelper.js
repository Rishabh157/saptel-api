const ledgerService = require("./LedgerService");
const { ledgerType } = require("../../helper/enumUtils");

exports.getDealerFromLedger = async (dealerId) => {
  const dealerFound = await ledgerService.findAllWithQuery({
    dealerId: dealerId,
  });
  if (!dealerFound) {
    throw new ApiError(httpStatus.OK, "Dealer Not Found.");
  }
  let dealerExitsId = dealerFound[0]?.dealerId;
  return dealerExitsId;
};

exports.getBalance = async (dealerExitsId, creditAmount, debitAmount) => {
  let lastObject = await ledgerService.aggregateQuery([
    {
      $match: {
        dealerId: dealerExitsId,
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);
  console.log(lastObject);
  let updatedBalance = 0;
  if (lastObject.length) {
    updatedBalance = parseInt(
      lastObject[0]?.balance + creditAmount - debitAmount
    );
    console.log("44444", updatedBalance);
  } else {
    updatedBalance = creditAmount - debitAmount;
    console.log("33333", updatedBalance);
  }

  return updatedBalance;
};
