const ledgerService = require("./LedgerService");
const { ledgerType } = require("../../helper/enumUtils");

const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const { ledgerXmlData } = require("./LedgerXmlData");
const axios = require("axios");
const config = require("../../../../config/config");

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

exports.getLedgerNo = async (noteType) => {
  let ledgerNumber = 0;
  let lastObject = await ledgerService.aggregateQuery([
    { $match: { noteType: noteType } },
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);
  if (lastObject.length) {
    ledgerNumber =
      parseInt(lastObject[0]?.ledgerNumber ? lastObject[0]?.ledgerNumber : 0) +
      1;
  } else {
    ledgerNumber = 1;
  }

  // Formatting the invoice number with leading zeros
  return ledgerNumber.toString().padStart(4, "0");
};
//add start
exports.addLedgerToTally = async (data) => {
  try {
    let xmlData = ledgerXmlData(data);
    // Repl ace 'your-api-endpoint-url' with the actual URL of the API you want to hit

    const apiEndpoint = `${config.tally_url}`;

    // Make the API request
    const response = await axios.post(apiEndpoint, xmlData, {
      headers: {
        "Content-Type": "application/xml", // Set the content type to XML
      },
    });

    // Handle the response
  } catch (err) {
    console.error("Error occurred:", err);
  }
};
exports.getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
};
