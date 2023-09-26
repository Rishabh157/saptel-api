const { default: axios } = require("axios");
const qs = require("qs");

// Shipyaari Auth keys
const avnkey = "22140@25394";
const serviceType = "";
const partner = "";
const service = "";

const getEstTimeFromShipYaari = async (data) => {
  try {
    data["avnkey"] = avnkey;
    data["service_type"] = serviceType;
    data["partner"] = partner;
    data["service"] = service;
    console.log(data);
    const formData = qs.stringify(data);
    const HEADER = {
      "Content-Type": "application/x-www-form-urlencoded", // Set the content type
    };
    let response = await axios.post(
      "https://seller.shipyaari.com/logistic/webservice/SearchAvailability_new.php",
      formData,
      { headers: HEADER }
    );
    console.log(response, "response");
    if (response) {
      return response.data;
    }
  } catch (err) {
    return err;
  }
};

module.exports = {
  getEstTimeFromShipYaari,
};
