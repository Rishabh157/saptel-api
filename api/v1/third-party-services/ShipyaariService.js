const { default: axios } = require("axios");
const qs = require("qs");
const config = require("../../../config/config");
const CourierPartnerToken = require("../../v1/src/courierPartnerToken/CourierPartnerTokenService");
const { preferredCourierPartner } = require("../helper/enumUtils");

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
    const formData = qs.stringify(data);
    const HEADER = {
      "Content-Type": "application/x-www-form-urlencoded", // Set the content type
    };
    let response = await axios.post(
      "https://seller.shipyaari.com/logistic/webservice/SearchAvailability_new.php",
      formData,
      { headers: HEADER }
    );
    if (response) {
      return response?.data?.length ? true : false;
    }
  } catch (err) {
    return err;
  }
};

const confirmOrderShipYaari = async (data) => {
  try {
    let shipyaariToken = await CourierPartnerToken?.getOneByMultiField({
      courierPartnerName: preferredCourierPartner.shipyaari,
    });
    const HEADER = {
      "Content-Type": "application/json", // Set the content type
      Authorization: `Bearer ${shipyaariToken?.token}`,
    };
    let response = await axios.post(
      `${config.shipyaari_baseurl}/api/v1/order/placeOrderApiV3`,
      data,
      { headers: HEADER }
    );
    if (response) {
      return response?.data?.success;
    }
  } catch (err) {
    console.log(err, "error");
    return false;
  }
};

const getShipyaariToken = async () => {
  try {
    console.log("innn", config.shipyaari_email, config.shipyaari_password);
    const HEADER = {
      "Content-Type": "application/json",
    };
    let response = await axios.post(
      `${config.shipyaari_baseurl}/api/v1/seller/signIn`,
      {
        email: config.shipyaari_email,
        password: config.shipyaari_password,
      },
      { headers: HEADER }
    );
    if (response?.data?.success) {
      let isExists = await CourierPartnerToken?.findCount({
        courierPartnerName: preferredCourierPartner.shipyaari,
      });
      if (isExists) {
        await CourierPartnerToken?.getOneAndUpdate(
          { courierPartnerName: preferredCourierPartner.shipyaari },
          {
            $set: {
              token: response?.data?.data?.[0]?.token,
            },
          }
        );
      } else {
        await CourierPartnerToken?.createNewData({
          courierPartnerName: preferredCourierPartner.shipyaari,
          token: response?.data?.data?.[0]?.token,
        });
      }
    }
  } catch (err) {
    console.log(err, "error");
    return false;
  }
};

module.exports = {
  getEstTimeFromShipYaari,
  confirmOrderShipYaari,
  getShipyaariToken,
};
