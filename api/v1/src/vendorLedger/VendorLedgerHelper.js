const vendorLedgerService = require("./VendorLedgerService");
const { ledgerType } = require("../../helper/enumUtils");

exports.getVendorFromLedger = async (vendorId) => {
  const vendorFound = await vendorLedgerService.findAllWithQuery({
    vendorId: vendorId,
  });
  if (!vendorFound) {
    throw new ApiError(httpStatus.OK, "Vendor Not Found.");
  }
  let vendorExitsId = vendorFound[0]?.vendorId;
  return vendorExitsId;
};

exports.getBalance = async (vendorExitsId, creditAmount, debitAmount) => {
  let lastObject = await vendorLedgerService.aggregateQuery([
    {
      $match: {
        vendorId: vendorExitsId,
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
