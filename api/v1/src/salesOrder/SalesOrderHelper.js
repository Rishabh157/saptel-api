const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const { errorRes } = require("../../../utils/resError");
const { SalesOrderXmlData } = require("./SalesOrderXmlData");
const axios = require("axios");
const config = require("../../../../config/config");
//add start
const addSalesOrderToTally = async (data) => {
  try {
    let xmlData = SalesOrderXmlData(data);

    // Replace 'your-api-endpoint-url' with the actual URL of the API you want to hit
    const apiEndpoint = `${config.tally_url}`;

    // Make the API request
    const response = await axios.post(apiEndpoint, xmlData, {
      headers: {
        "Content-Type": "application/xml", // Set the content type to XML
      },
    });

    // Handle the response
    console.log("API Response:", response.data);
  } catch (err) {
    console.error("Error occurred:", err);
  }
};
const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
};

module.exports = {
  addSalesOrderToTally,
  getFormattedDate,
};
