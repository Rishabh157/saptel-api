const { default: axios } = require("axios");
const qs = require("qs");
const config = require("../../../config/config");
const courierPartnerTokenService = require("../src/courierPartnerToken/CourierPartnerTokenService");
const orderService = require("../src/orderInquiry/OrderInquiryService");
const {
  preferredCourierPartner,
  orderStatusEnum,
} = require("../helper/enumUtils");
const {
  addToOrderFlow,
} = require("../src/orderInquiryFlow/OrderInquiryFlowHelper");

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
    let shipyaariToken = await courierPartnerTokenService?.getOneByMultiField({
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
      return { data: response?.data, status: true };
    }
  } catch (err) {
    return { data: err, status: false };
  }
};

const getShipyaariToken = async () => {
  try {
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
      let isExists = await courierPartnerTokenService?.findCount({
        courierPartnerName: preferredCourierPartner.shipyaari,
      });
      if (isExists) {
        await courierPartnerTokenService?.getOneAndUpdate(
          { courierPartnerName: preferredCourierPartner.shipyaari },
          {
            $set: {
              token: response?.data?.data?.[0]?.token,
            },
          }
        );
      } else {
        await courierPartnerTokenService?.createNewData({
          courierPartnerName: preferredCourierPartner.shipyaari,
          token: response?.data?.data?.[0]?.token,
        });
      }
    }
  } catch (err) {
    return false;
  }
};

const updateShipyaariStatus = async () => {
  try {
    // Set headers for axios requests
    let shipyaariToken = await courierPartnerTokenService?.getOneByMultiField({
      courierPartnerName: preferredCourierPartner.shipyaari,
    });

    const HEADER = {
      "Content-Type": "application/json", // Set the content type
      Authorization: `Bearer ${shipyaariToken?.token}`,
    };

    // Fetch all orders in transit assigned to Shipyaari
    const allIntranssiteShipyaariOrders = await orderService.aggregateQuery([
      {
        $match: {
          status: {
            $in: [orderStatusEnum.intransit],
          },
          orderAssignedToCourier: preferredCourierPartner.shipyaari,
        },
      },
    ]);

    if (
      !allIntranssiteShipyaariOrders ||
      allIntranssiteShipyaariOrders.length === 0
    ) {
      console.log("No Shipyaari orders in transit.");
      return;
    }

    console.log(allIntranssiteShipyaariOrders, "Shipyaari Orders In Transit");

    // Use Promise.all to run axios calls in parallel
    await Promise.all(
      allIntranssiteShipyaariOrders.map(async (ele) => {
        const { awbNumber, _id, orderNumber } = ele;

        try {
          // Make the API call to Shipyaari
          const response = await axios.get(
            `${config.shipyaari_baseurl}/api/v1/tracking/getTracking?trackingNo=${awbNumber}`,
            {
              email: config.shipyaari_email,
              password: config.shipyaari_password,
            },
            { headers: HEADER }
          );

          // Check for success response and get tracking info
          if (
            response?.data?.success &&
            response?.data?.data[0]?.trackingInfo?.length
          ) {
            const currentStatus =
              response.data?.data[0].trackingInfo[0].currentStatus;

            // Determine the order status based on the current status
            let newStatus;
            switch (currentStatus) {
              case "In Transit":
                newStatus = orderStatusEnum.intransit;
                break;
              case "Delivered":
                newStatus = orderStatusEnum.delivered;
                break;
              case "RTO In Transit":
              case "RTO Delivered":
              case "RTO Exception":
              case "RTO Created":
              case "RTO out for delivery":
                newStatus = orderStatusEnum.rto;
                break;
              default:
                newStatus = orderStatusEnum.intransit;
                break;
            }

            // Update the order with the new status
            const updatedOrder = await orderService.getOneAndUpdate(
              { _id },
              {
                $set: {
                  status: newStatus,
                  shipyaariStatus: currentStatus,
                },
              }
            );

            // Log order status update in the order flow
            await addToOrderFlow(
              updatedOrder._id,
              updatedOrder.orderNumber,
              `Order status updated by Shipyaari to: ${currentStatus}`,
              updatedOrder.status,
              req.userData.userName
            );
          } else {
            console.log(`No tracking info available for AWB: ${awbNumber}`);
          }
        } catch (error) {
          console.error(
            `Failed to fetch tracking info for AWB: ${awbNumber}`,
            error
          );
        }
      })
    );

    console.log("All orders processed successfully.");
  } catch (err) {
    console.error("Error updating Shipyaari status", err);
    return false;
  }
};

module.exports = {
  getEstTimeFromShipYaari,
  confirmOrderShipYaari,
  getShipyaariToken,
  updateShipyaariStatus,
};
