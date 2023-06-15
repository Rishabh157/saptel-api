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

exports.getBalance = async (dealerExitsId, noteType, price) => {
  let lastObject = await ledgerService.aggregateQuery([
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
    if (noteType === ledgerType.credit) {
      updatedBalance = parseInt(lastObject[0]?.balance + price);
    } else if (noteType === ledgerType.debit) {
      updatedBalance = parseInt(lastObject[0]?.balance - price);
    }
  } else {
    if (noteType === ledgerType.credit) {
      updatedBalance = price;
    } else if (noteType === ledgerType.debit) {
      updatedBalance = -price;
    }
  }
 
  return updatedBalance;
};
